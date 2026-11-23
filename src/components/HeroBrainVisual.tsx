import React, { useEffect, useRef } from 'react';
import { getIllustrativeSampleMRI } from '../utils/mriRenderer';

interface Node3D {
  x: number;
  y: number;
  z: number;
  hemisphere: -1 | 1;
  color: string;
  size: number;
}

export const HeroBrainVisual: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sampleSliceUrl = getIllustrativeSampleMRI('Glioma');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId = 0;
    const width = 580;
    const height = 460;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Construct anatomically-shaped 3D dual-hemisphere point cloud (seeded deterministic)
    const nodes: Node3D[] = [];
    let seed = 918273;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const palette = ['#8B5CF6', '#A855F7', '#3B82F6', '#22D3EE'];

    for (let i = 0; i < 145; i++) {
      const hemisphere: -1 | 1 = i % 2 === 0 ? -1 : 1;
      const u = rand() * Math.PI * 2;
      const v = Math.acos(2 * rand() - 1);
      const rScale = 0.78 + rand() * 0.24;

      // Sculpt elongated cerebral hemisphere contour
      let x = Math.sin(v) * Math.cos(u) * 66 * rScale + hemisphere * 38;
      let y = Math.cos(v) * 92 * rScale;
      let z = Math.sin(v) * Math.sin(u) * 116 * rScale;

      // Taper frontal pole & temporal curve subtly
      if (z > 40) {
        x *= 0.88;
        y *= 0.92;
      }
      if (y > 42) {
        y *= 0.82;
      }

      nodes.push({
        x,
        y,
        z,
        hemisphere,
        color: palette[i % palette.length],
        size: 1.5 + rand() * 2.1,
      });
    }

    // Precompute synaptic connections between nearby cortical nodes
    const edges: [number, number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      let count = 0;
      for (let j = i + 1; j < nodes.length && count < 3; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dz = nodes[i].z - nodes[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 52 && (nodes[i].hemisphere === nodes[j].hemisphere || Math.abs(nodes[i].x) < 28)) {
          edges.push([i, j, dist]);
          count++;
        }
      }
    }

    // Subtle floating ambient background particles
    const ambient = Array.from({ length: 34 }, () => ({
      x: rand() * width,
      y: rand() * height,
      r: 0.8 + rand() * 1.6,
      vx: (rand() - 0.5) * 0.16,
      vy: (rand() - 0.5) * 0.16,
      alpha: 0.15 + rand() * 0.35,
    }));

    let angle = 0.45;
    let scanPhase = 0;

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);

      // Soft central ambient radial glow
      const bgGlow = ctx.createRadialGradient(width / 2, height / 2, 18, width / 2, height / 2, 225);
      bgGlow.addColorStop(0, 'rgba(139, 92, 246, 0.22)');
      bgGlow.addColorStop(0.5, 'rgba(59, 130, 246, 0.09)');
      bgGlow.addColorStop(0.85, 'rgba(34, 211, 238, 0.04)');
      bgGlow.addColorStop(1, 'rgba(8, 11, 22, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Ambient particles
      for (const p of ambient) {
        if (!prefersReduced) {
          p.x = (p.x + p.vx + width) % width;
          p.y = (p.y + p.vy + height) % height;
        }
        ctx.fillStyle = `rgba(148, 163, 184, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw translucent orbital axial MRI slice rings
      ctx.save();
      ctx.translate(width / 2, height / 2);
      for (let ring = -1; ring <= 1; ring++) {
        const yOff = ring * 44 + Math.sin(scanPhase) * 8;
        ctx.strokeStyle =
          ring === 0 ? 'rgba(34, 211, 238, 0.28)' : 'rgba(139, 92, 246, 0.14)';
        ctx.lineWidth = ring === 0 ? 1.4 : 1;
        ctx.beginPath();
        ctx.ellipse(0, yOff, 175 - Math.abs(ring) * 28, 46 - Math.abs(ring) * 8, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Project 3D brain nodes
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const tilt = 0.22;
      const cosT = Math.cos(tilt);
      const sinT = Math.sin(tilt);

      const projected = nodes.map((n) => {
        const rx = n.x * cosA - n.z * sinA;
        const rz1 = n.x * sinA + n.z * cosA;
        const ry = n.y * cosT - rz1 * sinT;
        const rz = n.y * sinT + rz1 * cosT;

        const perspective = 460 / (460 - rz);
        return {
          sx: width / 2 + rx * perspective * 1.15,
          sy: height / 2 + ry * perspective * 1.05,
          depth: rz,
          scale: perspective,
          color: n.color,
          size: n.size,
        };
      });

      // Draw synaptic neural edges
      for (let eIdx = 0; eIdx < edges.length; eIdx++) {
        const [i, j] = edges[eIdx];
        const a = projected[i];
        const b = projected[j];
        const avgDepth = (a.depth + b.depth) / 2;
        const depthAlpha = Math.max(0.06, Math.min(0.42, (avgDepth + 140) / 340));

        ctx.strokeStyle =
          eIdx % 4 === 0
            ? `rgba(34, 211, 238, ${depthAlpha})`
            : `rgba(139, 92, 246, ${depthAlpha})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(a.sx, a.sy);
        ctx.lineTo(b.sx, b.sy);
        ctx.stroke();

        // Occasional traveling neural impulse highlight along select edges
        if (!prefersReduced && eIdx % 17 === 0) {
          const t = (scanPhase * 0.45 + eIdx * 0.13) % 1;
          const px = a.sx + (b.sx - a.sx) * t;
          const py = a.sy + (b.sy - a.sy) * t;
          ctx.fillStyle = 'rgba(34, 211, 238, 0.85)';
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw nodes sorted back-to-front
      const sorted = [...projected].sort((a, b) => a.depth - b.depth);
      for (const p of sorted) {
        const alpha = Math.max(0.22, Math.min(0.95, (p.depth + 130) / 250));
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, p.size * p.scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Subtle horizontal MRI scanning beam sweep
      const scanY = height / 2 + Math.sin(scanPhase * 0.65) * 118;
      const beamGrad = ctx.createLinearGradient(width / 2 - 165, scanY, width / 2 + 165, scanY);
      beamGrad.addColorStop(0, 'rgba(34, 211, 238, 0)');
      beamGrad.addColorStop(0.5, 'rgba(34, 211, 238, 0.38)');
      beamGrad.addColorStop(1, 'rgba(34, 211, 238, 0)');
      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 165, scanY);
      ctx.lineTo(width / 2 + 165, scanY);
      ctx.stroke();

      if (!prefersReduced) {
        angle += 0.0042;
        scanPhase += 0.02;
        animId = requestAnimationFrame(renderFrame);
      }
    };

    renderFrame();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-[600px]">
      {/* Main cinematic glass viewport frame */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-b from-[#141C31]/85 via-[#101629]/90 to-[#080B16]/95 p-3 shadow-2xl shadow-[#8B5CF6]/10">
        {/* Subtle inset MRI slice preview in corner */}
        <div className="pointer-events-none absolute right-5 top-5 z-10 hidden sm:block overflow-hidden rounded-xl border border-slate-700/70 bg-[#080B16]/90 p-1.5 backdrop-blur-md">
          <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-black">
            {sampleSliceUrl && (
              <img
                src={sampleSliceUrl}
                alt="Illustrative axial brain MRI slice preview"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover opacity-90"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#8B5CF6]/20 via-transparent to-[#22D3EE]/20" />
          </div>
          <p className="mt-1 text-center font-mono text-[10px] text-[#94A3B8]">Axial Slice</p>
        </div>

        <canvas
          ref={canvasRef}
          className="h-[340px] w-full sm:h-[420px] object-contain"
          aria-label="Interactive 3D neural network brain visualization with axial MRI scan planes"
        />

        {/* Bottom caption inside visual */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 px-3 pt-2.5 pb-1 text-xs text-[#94A3B8]">
          <span>3D Neural Pathway &amp; Axial Slice Composition</span>
          <span className="font-mono text-[11px] text-[#22D3EE]">Illustrative Demo Visualization</span>
        </div>
      </div>

      {/* Floating Metric Cards around the brain illustration — explicitly labeled Illustrative Demo */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:mt-0">
        <div className="rounded-xl border border-slate-700/70 bg-[#141C31]/90 px-4 py-3 backdrop-blur-xl shadow-lg lg:absolute lg:-left-6 lg:top-10 lg:w-48">
          <p className="text-[11px] font-medium text-[#94A3B8]">AI Confidence</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#F8FAFC] tabular-nums">
            98.4<span className="text-sm font-medium text-[#22D3EE]">%</span>
          </p>
          <p className="mt-0.5 text-[11px] text-[#94A3B8]">Illustrative Demo Metric</p>
        </div>

        <div className="rounded-xl border border-slate-700/70 bg-[#141C31]/90 px-4 py-3 backdrop-blur-xl shadow-lg lg:absolute lg:-right-5 lg:bottom-24 lg:w-48">
          <p className="text-[11px] font-medium text-[#94A3B8]">Models Active</p>
          <p className="mt-1 font-mono text-2xl font-bold text-[#F8FAFC] tabular-nums">
            3 <span className="text-xs font-normal text-[#A855F7]">+ Ensemble</span>
          </p>
          <p className="mt-0.5 text-[11px] text-[#94A3B8]">Demo Multi-Backbone</p>
        </div>

        <div className="rounded-xl border border-slate-700/70 bg-[#141C31]/90 px-4 py-3 backdrop-blur-xl shadow-lg lg:absolute lg:left-8 lg:-bottom-5 lg:w-52">
          <p className="text-[11px] font-medium text-[#94A3B8]">Analysis Status</p>
          <p className="mt-1 font-display text-lg font-bold text-[#10B981]">Ready</p>
          <p className="mt-0.5 text-[11px] text-[#94A3B8]">Demo Simulation Workspace</p>
        </div>
      </div>
    </div>
  );
};

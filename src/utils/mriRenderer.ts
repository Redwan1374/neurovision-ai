import { GradCAMHotspot, ModelKey, TumorCategory } from '../types/mri';

const sampleCache: Partial<Record<TumorCategory, string>> = {};

/** Deterministic PRNG for realistic MRI Rician texture synthesis */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generates crisp, high-resolution illustrative monochrome brain MRI slices
 * procedurally on an offscreen canvas. Explicitly used as illustrative demo
 * visuals rather than clinical diagnostic evidence.
 */
export function getIllustrativeSampleMRI(category: TumorCategory): string {
  if (sampleCache[category]) {
    return sampleCache[category]!;
  }
  if (typeof document === 'undefined') {
    return '';
  }

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const seedMap: Record<TumorCategory, number> = {
    Glioma: 104729,
    Meningioma: 224737,
    Pituitary: 350377,
    'No Tumor': 479909,
  };
  const rand = mulberry32(seedMap[category]);

  // Pure black MRI background
  ctx.fillStyle = '#040508';
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;

  if (category === 'Pituitary') {
    drawSagittalBrain(ctx, cx, cy, rand);
  } else {
    drawAxialBrain(ctx, cx, cy, category, rand);
  }

  // Apply subtle authentic MRI Rician noise grain inside the FOV
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const lum = data[i];
    if (lum > 6) {
      const grain = (rand() - 0.5) * 14;
      const v = Math.max(0, Math.min(255, lum + grain));
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = Math.min(255, v + 2);
    } else {
      const bgNoise = rand() * 4;
      data[i] = bgNoise;
      data[i + 1] = bgNoise;
      data[i + 2] = bgNoise + 1;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const url = canvas.toDataURL('image/png');
  sampleCache[category] = url;
  return url;
}

function drawAxialBrain(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  category: TumorCategory,
  rand: () => number
) {
  ctx.save();

  // Outer scalp / soft tissue ring
  const scalpGrad = ctx.createRadialGradient(cx, cy, 160, cx, cy, 212);
  scalpGrad.addColorStop(0, '#090b10');
  scalpGrad.addColorStop(0.72, '#3c404a');
  scalpGrad.addColorStop(0.84, '#6b707d');
  scalpGrad.addColorStop(0.93, '#252830');
  scalpGrad.addColorStop(1, '#040508');

  ctx.beginPath();
  ctx.ellipse(cx, cy, 178, 210, 0, 0, Math.PI * 2);
  ctx.fillStyle = scalpGrad;
  ctx.fill();

  // Dark cortical bone (skull table)
  ctx.beginPath();
  ctx.ellipse(cx, cy, 160, 192, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#0c0e14';
  ctx.fill();

  // Subarachnoid CSF rim
  ctx.beginPath();
  ctx.ellipse(cx, cy, 148, 178, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#181b22';
  ctx.fill();

  // Clip to cranial vault for hemispheres
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx, cy, 144, 173, 0, 0, Math.PI * 2);
  ctx.clip();

  // Cerebral parenchyma base (gray matter)
  const gmGrad = ctx.createRadialGradient(cx, cy - 10, 20, cx, cy, 175);
  gmGrad.addColorStop(0, '#7c828f');
  gmGrad.addColorStop(0.55, '#666c78');
  gmGrad.addColorStop(0.85, '#4c515c');
  gmGrad.addColorStop(1, '#252830');
  ctx.fillStyle = gmGrad;
  ctx.fillRect(cx - 160, cy - 190, 320, 380);

  // Inner white matter butterfly lobes (left and right hemispheres)
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx + side * 58, cy - 4, 62, 128, side * 0.06, 0, Math.PI * 2);
    const wmGrad = ctx.createRadialGradient(
      cx + side * 52,
      cy - 6,
      10,
      cx + side * 56,
      cy,
      125
    );
    wmGrad.addColorStop(0, '#b9bec8');
    wmGrad.addColorStop(0.55, '#9ea4b0');
    wmGrad.addColorStop(0.85, '#6c727e');
    wmGrad.addColorStop(1, 'rgba(72,77,88,0)');
    ctx.fillStyle = wmGrad;
    ctx.fill();
    ctx.restore();
  }

  // Cortical gyri & sulci folds along periphery
  ctx.strokeStyle = 'rgba(18, 20, 26, 0.72)';
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';
  for (let i = 0; i < 42; i++) {
    const angle = (i / 42) * Math.PI * 2;
    const rOuterX = 142;
    const rOuterY = 171;
    const depth = 16 + rand() * 20;
    const x1 = cx + Math.cos(angle) * rOuterX;
    const y1 = cy + Math.sin(angle) * rOuterY;
    const bend = (rand() - 0.5) * 0.16;
    const x2 = cx + Math.cos(angle + bend) * (rOuterX - depth);
    const y2 = cy + Math.sin(angle + bend) * (rOuterY - depth);
    const mx = (x1 + x2) / 2 + (rand() - 0.5) * 8;
    const my = (y1 + y2) / 2 + (rand() - 0.5) * 8;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(mx, my, x2, y2);
    ctx.stroke();
  }

  // Longitudinal fissure (midline)
  ctx.strokeStyle = 'rgba(10, 12, 16, 0.92)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 175);
  ctx.lineTo(cx, cy + 175);
  ctx.stroke();

  // Basal ganglia / thalamus subtle contrast
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(cx + side * 24, cy + 14, 18, 30, side * -0.15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(128, 134, 144, 0.55)';
    ctx.fill();
  }

  // Lateral ventricles (dark butterfly shape)
  const shiftX = category === 'Glioma' ? 7 : category === 'Meningioma' ? -5 : 0;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.fillStyle = '#0d1016';
    ctx.beginPath();
    ctx.moveTo(cx + shiftX + side * 3, cy - 12);
    ctx.bezierCurveTo(
      cx + shiftX + side * 12,
      cy - 54,
      cx + shiftX + side * 34,
      cy - 58,
      cx + shiftX + side * 22,
      cy - 8
    );
    ctx.bezierCurveTo(
      cx + shiftX + side * 18,
      cy + 18,
      cx + shiftX + side * 36,
      cy + 58,
      cx + shiftX + side * 18,
      cy + 62
    );
    ctx.bezierCurveTo(
      cx + shiftX + side * 6,
      cy + 45,
      cx + shiftX + side * 3,
      cy + 14,
      cx + shiftX + side * 3,
      cy - 12
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Illustrative focal region per category
  if (category === 'Glioma') {
    const lx = cx - 64;
    const ly = cy - 38;
    // Perilesional subtle dark edema halo
    const edema = ctx.createRadialGradient(lx, ly, 16, lx, ly, 58);
    edema.addColorStop(0, 'rgba(38, 42, 50, 0.72)');
    edema.addColorStop(0.65, 'rgba(42, 46, 56, 0.45)');
    edema.addColorStop(1, 'rgba(42, 46, 56, 0)');
    ctx.fillStyle = edema;
    ctx.beginPath();
    ctx.arc(lx, ly, 58, 0, Math.PI * 2);
    ctx.fill();

    // Irregular ring-enhancing hyperintense contour
    const core = ctx.createRadialGradient(lx - 4, ly - 3, 5, lx, ly, 31);
    core.addColorStop(0, '#5a606c');
    core.addColorStop(0.42, '#9fa6b4');
    core.addColorStop(0.72, '#e6ebf4');
    core.addColorStop(0.92, '#c8d0dc');
    core.addColorStop(1, 'rgba(160,168,180,0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 31, 26, -0.35, 0, Math.PI * 2);
    ctx.fill();

    // Subtle secondary nodule texture
    const sub = ctx.createRadialGradient(lx + 10, ly + 8, 2, lx + 10, ly + 8, 16);
    sub.addColorStop(0, 'rgba(235,240,248,0.85)');
    sub.addColorStop(1, 'rgba(235,240,248,0)');
    ctx.fillStyle = sub;
    ctx.beginPath();
    ctx.arc(lx + 10, ly + 8, 16, 0, Math.PI * 2);
    ctx.fill();
  } else if (category === 'Meningioma') {
    const mx = cx + 92;
    const my = cy - 48;
    // Well-circumscribed dural-based homogeneous bright lesion
    const menGrad = ctx.createRadialGradient(mx - 6, my + 2, 4, mx, my, 36);
    menGrad.addColorStop(0, '#f0f4fa');
    menGrad.addColorStop(0.68, '#d4dce8');
    menGrad.addColorStop(0.88, '#a8b2c2');
    menGrad.addColorStop(1, 'rgba(90,96,108,0)');
    ctx.fillStyle = menGrad;
    ctx.beginPath();
    ctx.ellipse(mx, my, 33, 36, 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Subtle dural tail along inner table
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.75)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 139, -0.78, -0.05);
    ctx.stroke();
  }

  ctx.restore();
  ctx.restore();
}

function drawSagittalBrain(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rand: () => number
) {
  ctx.save();

  // Cranial contour (sagittal head profile)
  ctx.beginPath();
  ctx.ellipse(cx + 6, cy - 12, 174, 158, -0.1, 0, Math.PI * 2);
  ctx.fillStyle = '#262a34';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx + 6, cy - 12, 162, 146, -0.1, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0c12';
  ctx.fill();

  // Brain cerebrum silhouette
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx - 128, cy + 28);
  ctx.bezierCurveTo(cx - 154, cy - 72, cx - 80, cy - 144, cx + 18, cy - 142);
  ctx.bezierCurveTo(cx + 124, cy - 140, cx + 160, cy - 58, cx + 144, cy + 24);
  ctx.bezierCurveTo(cx + 120, cy + 56, cx + 52, cy + 44, cx + 12, cy + 36);
  ctx.bezierCurveTo(cx - 32, cy + 26, cx - 88, cy + 52, cx - 128, cy + 28);
  ctx.closePath();

  const cerebGrad = ctx.createRadialGradient(cx, cy - 45, 24, cx, cy - 20, 165);
  cerebGrad.addColorStop(0, '#9ea5b2');
  cerebGrad.addColorStop(0.62, '#727885');
  cerebGrad.addColorStop(1, '#3e434e');
  ctx.fillStyle = cerebGrad;
  ctx.fill();

  ctx.clip();
  // Gyri curving inward
  ctx.strokeStyle = 'rgba(18, 21, 28, 0.72)';
  ctx.lineWidth = 3;
  for (let i = 0; i < 28; i++) {
    const t = -2.6 + (i / 27) * 3.1;
    const x1 = cx + Math.cos(t) * 145;
    const y1 = cy - 20 + Math.sin(t) * 128;
    const x2 = cx + Math.cos(t + (rand() - 0.5) * 0.14) * (112 - rand() * 18);
    const y2 = cy - 20 + Math.sin(t + (rand() - 0.5) * 0.14) * (96 - rand() * 16);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();

  // Corpus callosum arch (bright white matter band)
  ctx.strokeStyle = '#cfd5df';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 56, cy - 14);
  ctx.bezierCurveTo(cx - 42, cy - 58, cx + 38, cy - 56, cx + 56, cy - 16);
  ctx.stroke();

  // Ventricle cavity beneath corpus callosum
  ctx.fillStyle = '#0d1017';
  ctx.beginPath();
  ctx.ellipse(cx, cy - 8, 42, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Brainstem (midbrain, pons, medulla)
  ctx.fillStyle = '#8b92a0';
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy + 20);
  ctx.quadraticCurveTo(cx - 32, cy + 68, cx - 10, cy + 106);
  ctx.lineTo(cx - 2, cy + 168);
  ctx.lineTo(cx + 22, cy + 168);
  ctx.lineTo(cx + 24, cy + 92);
  ctx.quadraticCurveTo(cx + 30, cy + 48, cx + 18, cy + 22);
  ctx.closePath();
  ctx.fill();

  // Cerebellum with arbor vitae folds
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx + 72, cy + 84, 52, 42, -0.18, 0, Math.PI * 2);
  const cblGrad = ctx.createRadialGradient(cx + 66, cy + 84, 6, cx + 72, cy + 84, 54);
  cblGrad.addColorStop(0, '#b5bcc8');
  cblGrad.addColorStop(0.6, '#7a808d');
  cblGrad.addColorStop(1, '#363b45');
  ctx.fillStyle = cblGrad;
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = 'rgba(18,21,28,0.65)';
  ctx.lineWidth = 2.2;
  for (let i = 0; i < 12; i++) {
    const ang = -1.2 + (i / 11) * 2.4;
    ctx.beginPath();
    ctx.moveTo(cx + 42, cy + 84);
    ctx.lineTo(cx + 72 + Math.cos(ang) * 56, cy + 84 + Math.sin(ang) * 48);
    ctx.stroke();
  }
  ctx.restore();

  // Sellar / Pituitary focal bright rounded highlight
  const px = cx - 32;
  const py = cy + 36;
  const pitGrad = ctx.createRadialGradient(px - 2, py - 2, 3, px, py, 24);
  pitGrad.addColorStop(0, '#f4f7fc');
  pitGrad.addColorStop(0.58, '#d4dce9');
  pitGrad.addColorStop(0.84, '#929cab');
  pitGrad.addColorStop(1, 'rgba(92,98,110,0)');
  ctx.fillStyle = pitGrad;
  ctx.beginPath();
  ctx.ellipse(px, py, 22, 20, 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Computes Jet/Turbo scientific colormap RGB for activation intensity v in [0, 1]
 * Blue (lower) -> Cyan -> Green (moderate) -> Yellow (higher) -> Red (strongest)
 */
export function activationToRGBA(v: number): [number, number, number, number] {
  const clamped = Math.max(0, Math.min(1, v));
  if (clamped < 0.08) {
    return [14, 34, 128, Math.round((clamped / 0.08) * 70)];
  }
  let r = 0;
  let g = 0;
  let b = 0;
  if (clamped < 0.35) {
    const t = (clamped - 0.08) / 0.27;
    r = 0;
    g = Math.round(t * 210);
    b = Math.round(220 + t * 35);
  } else if (clamped < 0.62) {
    const t = (clamped - 0.35) / 0.27;
    r = Math.round(t * 245);
    g = Math.round(210 + t * 35);
    b = Math.round(255 * (1 - t));
  } else if (clamped < 0.85) {
    const t = (clamped - 0.62) / 0.23;
    r = 255;
    g = Math.round(245 - t * 175);
    b = 0;
  } else {
    const t = (clamped - 0.85) / 0.15;
    r = Math.round(255 - t * 35);
    g = Math.round(70 * (1 - t));
    b = Math.round(t * 24);
  }
  const alpha = Math.round(Math.min(240, 85 + clamped * 165));
  return [r, g, b, alpha];
}

/** Returns simulated Grad-CAM intensity at normalized coordinates (nx, ny) */
export function sampleActivationIntensity(
  nx: number,
  ny: number,
  hotspot: GradCAMHotspot,
  modelKey: ModelKey
): number {
  // Subtle backbone-specific spatial offset and scale so switching models shows distinct attention patterns
  const modelOffset: Record<ModelKey, { dx: number; dy: number; scale: number; secBoost: number }> = {
    efficientnet: { dx: 0.0, dy: 0.0, scale: 0.94, secBoost: 0.55 },
    densenet: { dx: 0.018, dy: -0.014, scale: 1.12, secBoost: 0.72 },
    convnext: { dx: -0.014, dy: 0.016, scale: 1.06, secBoost: 0.62 },
    ensemble: { dx: 0.002, dy: 0.001, scale: 1.0, secBoost: 0.64 },
  };

  const mod = modelOffset[modelKey];
  const cx1 = hotspot.x + mod.dx;
  const cy1 = hotspot.y + mod.dy;
  const r1 = hotspot.radius * mod.scale;

  const d1Sq = (nx - cx1) * (nx - cx1) + (ny - cy1) * (ny - cy1);
  let val = Math.exp(-d1Sq / (2 * r1 * r1));

  if (hotspot.secondaryX !== undefined && hotspot.secondaryY !== undefined && hotspot.secondaryRadius) {
    const cx2 = hotspot.secondaryX - mod.dx * 0.6;
    const cy2 = hotspot.secondaryY + mod.dy * 0.6;
    const r2 = hotspot.secondaryRadius * mod.scale;
    const d2Sq = (nx - cx2) * (nx - cx2) + (ny - cy2) * (ny - cy2);
    val = Math.max(val, mod.secBoost * Math.exp(-d2Sq / (2 * r2 * r2)));
  }

  // Broad subtle cortical background activation (weak blue-green baseline inside cranial silhouette)
  const distCenter = Math.sqrt((nx - 0.5) * (nx - 0.5) * 1.25 + (ny - 0.5) * (ny - 0.5));
  if (distCenter < 0.36) {
    const ambient = 0.14 * (1 - distCenter / 0.36) * hotspot.spread;
    val = Math.min(1, val + ambient);
  }

  return Math.max(0, Math.min(1, val));
}

/** Renders the procedural illustrative Grad-CAM heatmap onto a canvas element */
export function renderGradCAMToCanvas(
  canvas: HTMLCanvasElement,
  hotspot: GradCAMHotspot,
  modelKey: ModelKey
): void {
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = ctx.createImageData(size, size);
  const data = img.data;

  for (let y = 0; y < size; y++) {
    const ny = y / size;
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const intensity = sampleActivationIntensity(nx, ny, hotspot, modelKey);
      const [r, g, b, a] = activationToRGBA(intensity);
      const idx = (y * size + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = a;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/**
 * Extracts a simple deterministic hash and brightest interior region from an uploaded image
 * so simulated demo predictions and Grad-CAM focus feel responsive to the uploaded scan.
 */
export async function analyzeUploadedImageFeatures(
  imageUrl: string
): Promise<{ hash: number; focalX: number; focalY: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = 64;
        const h = 64;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ hash: 42, focalX: 0.42, focalY: 0.44 });
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const pixels = ctx.getImageData(0, 0, w, h).data;

        let hash = 2166136261;
        let maxWeight = -1;
        let bestX = 0.42;
        let bestY = 0.44;

        for (let y = 12; y < h - 12; y++) {
          for (let x = 12; x < w - 12; x++) {
            const idx = (y * w + x) * 4;
            const lum = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
            hash ^= Math.round(lum);
            hash = Math.imul(hash, 16777619);

            // Weight slightly away from exact center to avoid skull rim bias
            const dx = x / w - 0.5;
            const dy = y / h - 0.5;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 0.28) {
              const score = lum * (1 - dist * 0.6);
              if (score > maxWeight) {
                maxWeight = score;
                bestX = x / w;
                bestY = y / h;
              }
            }
          }
        }
        resolve({
          hash: Math.abs(hash),
          focalX: Math.max(0.28, Math.min(0.72, bestX)),
          focalY: Math.max(0.28, Math.min(0.72, bestY)),
        });
      } catch {
        resolve({ hash: 1337, focalX: 0.4, focalY: 0.43 });
      }
    };
    img.onerror = () => resolve({ hash: 1337, focalX: 0.4, focalY: 0.43 });
    img.src = imageUrl;
  });
}

/** Goa scenery drawn as canvas paths — no assets, caller supplies the fill. */

/** Palm rooted at (x, baseY), growing upward. */
export function drawPalm(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  height: number,
  fill: string,
) {
  const lean = height * 0.14;
  const trunkW = Math.max(3, height * 0.035);
  const topX = x + lean;
  const topY = baseY - height;

  ctx.save();
  ctx.fillStyle = fill;

  ctx.beginPath();
  ctx.moveTo(x - trunkW, baseY);
  ctx.quadraticCurveTo(x + lean * 0.2, baseY - height * 0.55, topX - trunkW * 0.4, topY);
  ctx.lineTo(topX + trunkW * 0.4, topY);
  ctx.quadraticCurveTo(x + lean * 0.2 + trunkW, baseY - height * 0.55, x + trunkW, baseY);
  ctx.closePath();
  ctx.fill();

  const frondL = height * 0.42;
  for (let i = 0; i < 6; i++) {
    const spread = -Math.PI * 0.92 + (i * Math.PI * 0.84) / 5;
    const tipX = topX + Math.cos(spread) * frondL;
    const tipY = topY + Math.sin(spread) * frondL * 0.62 + frondL * 0.16;
    const midX = (topX + tipX) / 2;
    const midY = (topY + tipY) / 2 - frondL * 0.24;
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.quadraticCurveTo(midX, midY, tipX, tipY);
    ctx.quadraticCurveTo(midX, midY + frondL * 0.16, topX, topY + trunkW);
    ctx.closePath();
    ctx.fill();
  }

  const nut = Math.max(2, height * 0.028);
  ctx.beginPath();
  ctx.arc(topX - nut * 1.6, topY + nut * 1.4, nut, 0, Math.PI * 2);
  ctx.arc(topX + nut * 1.6, topY + nut * 2, nut, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Top-down plane silhouette centred on (x, y), nose pointing along `angle`. */
export function drawPlane(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  angle: number,
  fill: string,
) {
  const u = size / 2;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = fill;

  ctx.beginPath();
  ctx.moveTo(u, 0);
  ctx.quadraticCurveTo(u * 0.35, u * 0.16, u * 0.1, u * 0.18);
  ctx.lineTo(-u * 0.5, u * 0.82);
  ctx.lineTo(-u * 0.74, u * 0.82);
  ctx.lineTo(-u * 0.42, u * 0.16);
  ctx.lineTo(-u * 0.78, u * 0.16);
  ctx.lineTo(-u * 0.98, u * 0.44);
  ctx.lineTo(-u, 0);
  ctx.lineTo(-u * 0.98, -u * 0.44);
  ctx.lineTo(-u * 0.78, -u * 0.16);
  ctx.lineTo(-u * 0.42, -u * 0.16);
  ctx.lineTo(-u * 0.74, -u * 0.82);
  ctx.lineTo(-u * 0.5, -u * 0.82);
  ctx.lineTo(u * 0.1, -u * 0.18);
  ctx.quadraticCurveTo(u * 0.35, -u * 0.16, u, 0);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/** Shallow sine rows suggesting surf. */
export function drawWaves(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  fill: string,
  rows = 2,
) {
  ctx.save();
  ctx.strokeStyle = fill;
  ctx.lineCap = "round";

  for (let r = 0; r < rows; r++) {
    const rowY = y + r * 14;
    const amp = 5 - r;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= width; i += 6) {
      const wy = rowY + Math.sin((i / width) * Math.PI * 8 + r * 1.2) * amp;
      if (i === 0) ctx.moveTo(x + i, wy);
      else ctx.lineTo(x + i, wy);
    }
    ctx.stroke();
  }

  ctx.restore();
}

/** Staggered palm clusters at both ends plus a surf line between them. */
export function drawPalmHorizon(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  width: number,
  fill: string,
  unitScale = 0.06,
) {
  const unit = width * unitScale;
  const left = [
    { dx: 0.02, h: 2.6 },
    { dx: 0.11, h: 1.8 },
    { dx: 0.19, h: 2.15 },
  ];
  const right = [
    { dx: 0.82, h: 2.0 },
    { dx: 0.9, h: 2.75 },
    { dx: 0.97, h: 1.7 },
  ];

  for (const p of [...left, ...right]) {
    drawPalm(ctx, x + width * p.dx, baseY, unit * p.h, fill);
  }

  drawWaves(ctx, x + width * 0.28, baseY - unit * 0.5, width * 0.44, fill, 2);
}

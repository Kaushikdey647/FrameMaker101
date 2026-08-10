import { GOA_DEST_IATA, type IndiaAirport } from "./india-airports";
import { BRAND, type RouteMotif } from "./style-kit";

const { green: GREEN, deep: DEEP, yellow: YELLOW, magenta: MAGENTA, cream: CREAM, ink: INK, black: BLACK } =
  BRAND;

export type RouteDrawOpts = {
  origin: IndiaAirport;
  x: number;
  y: number;
  w: number;
  h?: number;
  motif: RouteMotif;
};

function shortCity(city: string, max = 14): string {
  const t = city.trim().toUpperCase();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function drawPlane(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  fill: string,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(-8, -7);
  ctx.lineTo(-4, 0);
  ctx.lineTo(-8, 7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMechaPalm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
  color: string,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";
  ctx.beginPath();
  const pts = [
    [0, -28],
    [6, -10],
    [24, -10],
    [10, 2],
    [16, 20],
    [0, 10],
    [-16, 20],
    [-10, 2],
    [-24, -10],
    [-6, -10],
  ];
  for (let i = 0; i < pts.length; i++) {
    const [px, py] = pts[i]!;
    if (i === 0) ctx.moveTo(px + 34, py - 8);
    else ctx.lineTo(px + 34, py - 8);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-40, 22, 78, 12);
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-8, 22);
  ctx.lineTo(-14, -8);
  ctx.lineTo(-6, -40);
  ctx.stroke();
  ctx.lineWidth = 5;
  for (const [ax, ay] of [
    [-48, -28],
    [-30, -52],
    [2, -56],
    [28, -44],
    [40, -22],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(-6, -38);
    ctx.lineTo(ax, ay);
    ctx.stroke();
  }
  ctx.restore();
}

/** Two hard IATA tiles + angular flight beam. */
function boardingStrip(ctx: CanvasRenderingContext2D, opts: RouteDrawOpts) {
  const { origin, x, y, w } = opts;
  const h = opts.h ?? 88;
  const tileW = Math.min(150, w * 0.28);
  const gap = 16;
  const beamLeft = x + tileW + gap;
  const beamRight = x + w - tileW - gap;
  const midY = y + h / 2;

  // Origin tile
  ctx.fillStyle = CREAM;
  ctx.fillRect(x, y, tileW, h);
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, tileW, h);
  ctx.fillStyle = MAGENTA;
  ctx.fillRect(x, y, 8, h);
  ctx.fillStyle = INK;
  ctx.font = `900 42px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(origin.iata, x + tileW / 2 + 4, midY - 10);
  ctx.font = `700 12px "DM Sans", system-ui, sans-serif`;
  ctx.fillStyle = GREEN;
  ctx.fillText(shortCity(origin.city), x + tileW / 2 + 4, midY + 22);

  // GOI tile
  const gx = x + w - tileW;
  ctx.fillStyle = YELLOW;
  ctx.fillRect(gx, y, tileW, h);
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 4;
  ctx.strokeRect(gx, y, tileW, h);
  ctx.fillStyle = GREEN;
  ctx.fillRect(gx + tileW - 8, y, 8, h);
  ctx.fillStyle = GREEN;
  ctx.font = `900 42px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.fillText(GOA_DEST_IATA, gx + tileW / 2 - 4, midY - 10);
  ctx.font = `700 12px "DM Sans", system-ui, sans-serif`;
  ctx.fillText("GOA", gx + tileW / 2 - 4, midY + 22);

  // Beam
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 6;
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.moveTo(beamLeft, midY);
  ctx.lineTo(beamRight, midY);
  ctx.stroke();
  // Chevrons along beam
  ctx.fillStyle = MAGENTA;
  for (let t = 0.25; t < 0.9; t += 0.25) {
    const cx = beamLeft + (beamRight - beamLeft) * t;
    ctx.beginPath();
    ctx.moveTo(cx + 10, midY);
    ctx.lineTo(cx - 6, midY - 8);
    ctx.lineTo(cx - 6, midY + 8);
    ctx.closePath();
    ctx.fill();
  }
  drawPlane(ctx, (beamLeft + beamRight) / 2, midY, 1.4, CREAM);
}

/** Flip-board FROM / TO cells. */
function splitFlap(ctx: CanvasRenderingContext2D, opts: RouteDrawOpts) {
  const { origin, x, y, w } = opts;
  const h = opts.h ?? 100;
  const cellH = (h - 8) / 2;

  const drawCell = (cy: number, label: string, code: string, bg: string, fg: string) => {
    ctx.fillStyle = bg;
    ctx.fillRect(x, cy, w, cellH);
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, cy, w, cellH);
    // hinge
    ctx.fillStyle = MAGENTA;
    ctx.fillRect(x, cy + cellH / 2 - 1, w, 2);
    ctx.fillStyle = fg;
    ctx.font = `700 14px "DM Sans", system-ui, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + 16, cy + cellH / 2);
    ctx.font = `900 36px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = "right";
    ctx.fillText(code, x + w - 16, cy + cellH / 2);
  };

  drawCell(y, "FROM", origin.iata, DEEP, YELLOW);
  drawCell(y + cellH + 8, "TO", GOA_DEST_IATA, GREEN, CREAM);
}

/** Destination crest + DEP pill. */
function coastCrest(ctx: CanvasRenderingContext2D, opts: RouteDrawOpts) {
  const { origin, x, y, w } = opts;
  const h = opts.h ?? 120;

  // DEP pill
  const pillW = 140;
  ctx.fillStyle = CREAM;
  ctx.fillRect(x, y + h / 2 - 22, pillW, 44);
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y + h / 2 - 22, pillW, 44);
  ctx.fillStyle = INK;
  ctx.font = `700 16px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`DEP · ${origin.iata}`, x + pillW / 2, y + h / 2);

  // Arc
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x + w * 0.55, y + h + 40, h * 0.95, -Math.PI * 0.95, -Math.PI * 0.15);
  ctx.stroke();

  // GOI crest
  const cx = x + w - 70;
  const cy = y + h / 2;
  ctx.fillStyle = YELLOW;
  ctx.font = `900 56px "Archivo Black", Impact, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(GOA_DEST_IATA, cx, cy + 8);
  drawMechaPalm(ctx, cx + 50, cy - 30, 0.7, CREAM);
}

/** Diagonal festival tape across a region. */
function tapeSlash(ctx: CanvasRenderingContext2D, opts: RouteDrawOpts) {
  const { origin, x, y, w } = opts;
  const h = opts.h ?? 160;
  const label = `${origin.iata}  ✈  ${GOA_DEST_IATA}`;

  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((-18 * Math.PI) / 180);
  const tw = w * 1.15;
  const th = 56;
  ctx.fillStyle = MAGENTA;
  ctx.fillRect(-tw / 2, -th / 2, tw, th);
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 4;
  ctx.strokeRect(-tw / 2, -th / 2, tw, th);
  ctx.fillStyle = YELLOW;
  ctx.fillRect(-tw / 2, -th / 2, tw, 6);
  ctx.fillRect(-tw / 2, th / 2 - 6, tw, 6);
  ctx.fillStyle = CREAM;
  ctx.font = `900 32px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 0, 2);
  ctx.restore();
}

/** Radar quarter-arcs from origin node to GOI. */
function radarHop(ctx: CanvasRenderingContext2D, opts: RouteDrawOpts) {
  const { origin, x, y, w } = opts;
  const h = opts.h ?? 110;
  const ox = x + 36;
  const oy = y + h - 16;
  const gx = x + w - 36;
  const gy = y + 20;

  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 2;
  for (let i = 1; i <= 4; i++) {
    const r = 28 * i;
    ctx.beginPath();
    ctx.arc(ox, oy, r, -Math.PI / 2.2, -0.15);
    ctx.stroke();
  }
  // hop line
  ctx.strokeStyle = MAGENTA;
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.quadraticCurveTo((ox + gx) / 2, y - 10, gx, gy);
  ctx.stroke();
  ctx.setLineDash([]);

  // nodes
  for (const [nx, ny, fill, code] of [
    [ox, oy, CREAM, origin.iata],
    [gx, gy, YELLOW, GOA_DEST_IATA],
  ] as const) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(nx, ny, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = `900 11px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(code, nx, ny);
  }

  drawMechaPalm(ctx, gx + 28, gy + 8, 0.45, CREAM);
}

export function drawRouteMotif(
  ctx: CanvasRenderingContext2D,
  opts: RouteDrawOpts,
): void {
  switch (opts.motif) {
    case "boardingStrip":
      boardingStrip(ctx, opts);
      break;
    case "splitFlap":
      splitFlap(ctx, opts);
      break;
    case "coastCrest":
      coastCrest(ctx, opts);
      break;
    case "tapeSlash":
      tapeSlash(ctx, opts);
      break;
    case "radarHop":
      radarHop(ctx, opts);
      break;
    default: {
      const _e: never = opts.motif;
      void _e;
    }
  }
}

/** Compact barcode-style IATA footer for lanyard. */
export function drawIataBarcodeStrip(
  ctx: CanvasRenderingContext2D,
  origin: IndiaAirport,
  x: number,
  y: number,
  w: number,
) {
  ctx.fillStyle = DEEP;
  ctx.fillRect(x, y, w, 36);
  ctx.fillStyle = YELLOW;
  ctx.font = `700 18px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`${origin.iata} ▌▌▌ ${GOA_DEST_IATA}`, x + 12, y + 18);
  // faux bars
  ctx.fillStyle = CREAM;
  for (let i = 0; i < 24; i++) {
    const bw = i % 3 === 0 ? 3 : 1;
    ctx.fillRect(x + w - 140 + i * 5, y + 8, bw, 20);
  }
}

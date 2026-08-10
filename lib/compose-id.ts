import { JPEG_QUALITY } from "./compose";
import { pickBuilderTitle } from "./builder-titles";
import { GOA_DEST_IATA, type IndiaAirport } from "./india-airports";
import { BRAND, ID_THEMES, type IdTheme } from "./style-kit";

export const ID_WIDTH = 1080;
export const ID_HEIGHT = 1350;

const {
  green: GREEN,
  deep: GREEN_DEEP,
  yellow: YELLOW,
  magenta: MAGENTA,
  cream: CREAM,
  paper: PAPER,
  ink: INK,
  black: BLACK,
} = BRAND;

export type ComposeIdInput = {
  photo: ImageBitmap;
  name: string;
  role: string;
  serial: string;
  origin: IndiaAirport;
  theme?: IdTheme;
};

let wordmarkPromise: Promise<HTMLImageElement> | null = null;

function loadWordmark(): Promise<HTMLImageElement> {
  if (!wordmarkPromise) {
    wordmarkPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load title wordmark"));
      img.src = "/assets/title-transparent.svg";
    });
  }
  return wordmarkPromise;
}

function coverRect(
  ctx: CanvasRenderingContext2D,
  source: ImageBitmap,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / source.width, h / source.height);
  const dw = source.width * scale;
  const dh = source.height * scale;
  const dx = x + (w - dw) / 2;
  const dy = y + (h - dh) / 2;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(source, dx, dy, dw, dh);
  ctx.restore();
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  baseSize: number,
  minSize: number,
  fontFamily: string,
): number {
  let size = baseSize;
  ctx.font = `700 ${size}px ${fontFamily}`;
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `700 ${size}px ${fontFamily}`;
  }
  return size;
}

function drawCornerTicks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const tick = 36;
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 6;
  ctx.lineCap = "square";
  for (const [tx, ty, dx, dy] of [
    [x, y, 1, 0],
    [x, y, 0, 1],
    [x + w, y, -1, 0],
    [x + w, y, 0, 1],
    [x, y + h, 1, 0],
    [x, y + h, 0, -1],
    [x + w, y + h, -1, 0],
    [x + w, y + h, 0, -1],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + dx * tick, ty + dy * tick);
    ctx.stroke();
  }
}

function drawMechaPalm(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale = 1,
  color: string = CREAM,
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

function drawRouteGraphic(
  ctx: CanvasRenderingContext2D,
  originIata: string,
  x: number,
  y: number,
  w: number,
  style: IdTheme["routeStyle"],
) {
  const startX = x + 8;
  const endX = x + w - 72;
  const baseY = y + 42;
  const midX = (startX + endX) / 2;
  const peakY = y + 8;

  const ink = style === "dashedCream" ? CREAM : style === "minimalIata" ? YELLOW : CREAM;
  const pathColor = style === "dashedCream" ? CREAM : YELLOW;

  ctx.fillStyle = ink;
  ctx.font = `700 28px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(originIata, startX, baseY);

  if (style === "minimalIata") {
    ctx.fillStyle = MAGENTA;
    ctx.font = `700 18px "DM Sans", system-ui, sans-serif`;
    ctx.fillText("→", midX - 10, baseY);
    ctx.fillStyle = ink;
    ctx.font = `700 28px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = "right";
    ctx.fillText(GOA_DEST_IATA, endX + 64, baseY);
    return;
  }

  ctx.strokeStyle = pathColor;
  ctx.lineWidth = 3;
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";
  ctx.setLineDash(style === "dashedCream" ? [4, 8] : [8, 6]);
  ctx.beginPath();
  ctx.moveTo(startX + 58, baseY - 4);
  ctx.lineTo(midX - 24, peakY + 20);
  ctx.lineTo(midX, peakY);
  ctx.lineTo(midX + 24, peakY + 20);
  ctx.lineTo(endX - 8, baseY - 4);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = pathColor;
  ctx.beginPath();
  ctx.moveTo(midX + 10, peakY + 2);
  ctx.lineTo(midX - 8, peakY - 6);
  ctx.lineTo(midX - 2, peakY + 2);
  ctx.lineTo(midX - 8, peakY + 12);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = ink;
  ctx.font = `700 28px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = "right";
  ctx.fillText(GOA_DEST_IATA, endX + 64, baseY);

  drawMechaPalm(ctx, endX + 28, y + 8, 0.55, ink);
}

function drawPerforation(
  ctx: CanvasRenderingContext2D,
  y: number,
  left: number,
  right: number,
  dense: boolean,
) {
  const step = dense ? 16 : 22;
  const r = dense ? 5 : 7;
  ctx.fillStyle = GREEN_DEEP;
  for (let x = left + 18; x < right - 10; x += step) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawHalftoneDots(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.fillStyle = "rgba(11,77,44,0.1)";
  for (let row = 0; row < h; row += 12) {
    for (let col = 0; col < w; col += 12) {
      const r = (row + col) % 24 === 0 ? 1.5 : 0.9;
      ctx.beginPath();
      ctx.arc(x + col + 2, y + row + 2, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

function drawAccentRail(
  ctx: CanvasRenderingContext2D,
  theme: IdTheme,
  y: number,
  h = 6,
) {
  switch (theme.accentRail) {
    case "magenta":
      ctx.fillStyle = MAGENTA;
      ctx.fillRect(0, y, ID_WIDTH, h);
      break;
    case "yellow":
      ctx.fillStyle = YELLOW;
      ctx.fillRect(0, y, ID_WIDTH, h);
      break;
    case "dual":
      ctx.fillStyle = YELLOW;
      ctx.fillRect(0, y, ID_WIDTH, h);
      ctx.fillStyle = MAGENTA;
      ctx.fillRect(0, y + h, ID_WIDTH, h);
      break;
    default: {
      const _e: never = theme.accentRail;
      void _e;
    }
  }
}

function stubFill(stub: IdTheme["stub"]): string {
  switch (stub) {
    case "paper":
      return PAPER;
    case "green":
      return GREEN;
    case "magenta":
      return MAGENTA;
    default: {
      const _e: never = stub;
      return _e;
    }
  }
}

export async function composeBuilderId(input: ComposeIdInput): Promise<{
  blob: Blob;
  title: string;
}> {
  const theme = input.theme ?? ID_THEMES[0]!;
  const { photo, name, role, serial, origin } = input;
  const title = pickBuilderTitle(name, serial);
  const displayName = name.trim().toUpperCase() || "BUILDER";
  const displayRole = role.trim().toUpperCase() || "BUILDER";

  const wordmark =
    theme.titleMark === "wordmarkSVG" ? await loadWordmark() : null;

  const canvas = document.createElement("canvas");
  canvas.width = ID_WIDTH;
  canvas.height = ID_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");

  const stubH = Math.round(ID_HEIGHT * theme.stubHRatio);
  const bodyH = ID_HEIGHT - stubH;
  const bannerH = theme.layout === "bannerTop" ? 110 : 0;

  ctx.fillStyle = GREEN_DEEP;
  ctx.fillRect(0, 0, ID_WIDTH, bodyH);
  coverRect(ctx, photo, 0, bannerH, ID_WIDTH, bodyH - bannerH);

  if (theme.photoTreatment === "greenWash" || theme.photoTreatment === "clean") {
    const fade = ctx.createLinearGradient(0, bodyH * 0.35, 0, bodyH);
    fade.addColorStop(0, "rgba(8,56,33,0)");
    fade.addColorStop(0.45, "rgba(8,56,33,0.35)");
    fade.addColorStop(1, "rgba(8,56,33,0.88)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, bannerH, ID_WIDTH, bodyH - bannerH);
  }

  if (theme.photoTreatment === "halftoneEdge") {
    ctx.save();
    const band = 120;
    ctx.beginPath();
    ctx.rect(0, bodyH - band, ID_WIDTH, band);
    ctx.clip();
    drawHalftoneDots(ctx, 0, bodyH - band, ID_WIDTH, band);
    ctx.fillStyle = "rgba(8,56,33,0.55)";
    ctx.fillRect(0, bodyH - band, ID_WIDTH, band);
    ctx.restore();
  }

  if (theme.layout === "bannerTop") {
    ctx.fillStyle = GREEN;
    ctx.fillRect(0, 0, ID_WIDTH, bannerH);
    drawAccentRail(ctx, theme, bannerH - 6, 3);
    if (wordmark) {
      const mw = 200;
      const mh = (mw * wordmark.naturalHeight) / wordmark.naturalWidth;
      ctx.drawImage(wordmark, 36, (bannerH - mh) / 2, mw, mh);
    } else {
      ctx.fillStyle = YELLOW;
      ctx.font = `700 28px "Archivo Black", Impact, sans-serif`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("HACKER HOUSE GOA", 40, bannerH / 2);
    }
  } else {
    ctx.strokeStyle = GREEN;
    ctx.lineWidth = 16;
    ctx.strokeRect(8, 8, ID_WIDTH - 16, bodyH - 16);
    ctx.strokeStyle = YELLOW;
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, ID_WIDTH - 40, bodyH - 40);
    drawCornerTicks(ctx, 28, 28, ID_WIDTH - 56, bodyH - 56);
  }

  if (theme.titleMark === "wordmarkSVG" && wordmark && theme.layout !== "bannerTop") {
    const mw = 240;
    const mh = (mw * wordmark.naturalHeight) / wordmark.naturalWidth;
    ctx.drawImage(wordmark, 40, 36, mw, mh);
  } else if (theme.titleMark === "textChip") {
    ctx.fillStyle = GREEN;
    ctx.fillRect(40, 40, 280, 44);
    ctx.strokeStyle = BLACK;
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, 280, 44);
    ctx.fillStyle = YELLOW;
    ctx.font = `700 18px "DM Sans", system-ui, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("HH GOA 2026", 56, 62);
  }

  const routeY =
    theme.layout === "bannerTop" ? bannerH + 24 : bodyH * 0.42;
  drawRouteGraphic(ctx, origin.iata, 40, routeY, 420, theme.routeStyle);

  const typeMax = ID_WIDTH - 80;
  const showNameOnBody = theme.nameBlock !== "stubOnlyName";

  if (showNameOnBody) {
    const nameX = theme.nameBlock === "centerStack" ? ID_WIDTH / 2 : 40;
    const align = theme.nameBlock === "centerStack" ? "center" : "left";
    ctx.textAlign = align;
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = theme.stub === "magenta" ? YELLOW : CREAM;
    const nameSize = fitText(
      ctx,
      displayName,
      typeMax,
      theme.nameBlock === "centerStack" ? 64 : 72,
      36,
      `"Archivo Black", Impact, sans-serif`,
    );
    ctx.font = `700 ${nameSize}px "Archivo Black", Impact, sans-serif`;
    ctx.fillText(displayName, nameX, bodyH - 150);

    ctx.fillStyle = MAGENTA;
    const roleSize = fitText(
      ctx,
      displayRole,
      typeMax,
      36,
      20,
      `"DM Sans", system-ui, sans-serif`,
    );
    ctx.font = `700 ${roleSize}px "DM Sans", system-ui, sans-serif`;
    ctx.fillText(displayRole, nameX, bodyH - 108);
  }

  // Witty title stamp
  ctx.font = `700 26px "DM Sans", system-ui, sans-serif`;
  const stampPadX = 18;
  const stampW = Math.min(typeMax, ctx.measureText(title).width + stampPadX * 2);
  const stampH = 48;
  const stampX =
    theme.nameBlock === "centerStack" ? (ID_WIDTH - stampW) / 2 : 40;
  const stampY = bodyH - 88;

  switch (theme.stampTitle) {
    case "magentaBar":
      ctx.fillStyle = MAGENTA;
      ctx.fillRect(stampX, stampY, stampW, stampH);
      ctx.strokeStyle = BLACK;
      ctx.lineWidth = 3;
      ctx.strokeRect(stampX, stampY, stampW, stampH);
      ctx.fillStyle = CREAM;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(title, stampX + stampW / 2, stampY + stampH / 2 + 1);
      break;
    case "yellowOutline":
      ctx.lineWidth = 5;
      ctx.strokeStyle = YELLOW;
      ctx.strokeRect(stampX, stampY, stampW, stampH);
      ctx.fillStyle = YELLOW;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(title, stampX + stampW / 2, stampY + stampH / 2 + 1);
      break;
    case "creamChip":
      ctx.fillStyle = CREAM;
      ctx.fillRect(stampX, stampY, stampW, stampH);
      ctx.strokeStyle = BLACK;
      ctx.lineWidth = 3;
      ctx.strokeRect(stampX, stampY, stampW, stampH);
      ctx.fillStyle = GREEN;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(title, stampX + stampW / 2, stampY + stampH / 2 + 1);
      break;
    default: {
      const _e: never = theme.stampTitle;
      void _e;
    }
  }

  // Ticket stub
  const stubY = bodyH;
  ctx.fillStyle = stubFill(theme.stub);
  ctx.fillRect(0, stubY, ID_WIDTH, stubH);
  if (theme.stub === "paper") {
    drawHalftoneDots(ctx, 0, stubY, ID_WIDTH, stubH);
  }

  drawAccentRail(ctx, theme, stubY, theme.accentRail === "dual" ? 5 : 6);
  drawPerforation(
    ctx,
    stubY + 2,
    0,
    ID_WIDTH,
    theme.layout === "fullBleedStubThin",
  );

  ctx.fillStyle =
    theme.stub === "paper" ? GREEN_DEEP : notchFill(theme.stub);
  ctx.beginPath();
  ctx.arc(0, stubY + stubH / 2, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ID_WIDTH, stubY + stubH / 2, 22, 0, Math.PI * 2);
  ctx.fill();

  const stubMid = stubY + stubH / 2;
  const stubInk = theme.stub === "magenta" || theme.stub === "green" ? CREAM : INK;
  const stubMuted = theme.stub === "magenta" || theme.stub === "green" ? YELLOW : GREEN;

  if (theme.nameBlock === "stubOnlyName") {
    ctx.fillStyle = stubInk;
    ctx.font = `700 32px "Archivo Black", Impact, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(displayName.slice(0, 18), 48, stubMid - 28);
    ctx.fillStyle = stubMuted;
    ctx.font = `700 16px "DM Sans", system-ui, sans-serif`;
    ctx.fillText(displayRole.slice(0, 24), 48, stubMid + 4);
    ctx.fillStyle = stubInk;
    ctx.font = `700 22px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = "right";
    ctx.fillText(serial, ID_WIDTH - 48, stubMid + 28);
  } else {
    ctx.fillStyle = stubMuted;
    ctx.font = `700 18px "DM Sans", system-ui, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("HACKER HOUSE GOA", 48, stubMid - 36);
    ctx.fillStyle = stubInk;
    ctx.font = `700 15px "DM Sans", system-ui, sans-serif`;
    ctx.fillText("OCT 28–31  ·  2026", 48, stubMid - 12);

    ctx.fillStyle = stubInk;
    ctx.font = `700 28px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.fillText(serial, ID_WIDTH / 2, stubMid + 28);

    ctx.fillStyle = theme.stub === "magenta" ? YELLOW : MAGENTA;
    ctx.font = `700 16px "DM Sans", system-ui, sans-serif`;
    ctx.textAlign = "right";
    ctx.fillText("GOI  ·  #FrameInGoa", ID_WIDTH - 48, stubMid + 8);
  }

  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, ID_WIDTH - 8, ID_HEIGHT - 8);

  return { blob: await canvasToJpeg(canvas), title };
}

function notchFill(stub: IdTheme["stub"]): string {
  switch (stub) {
    case "green":
      return GREEN_DEEP;
    case "magenta":
      return "#C41860";
    case "paper":
      return GREEN_DEEP;
    default: {
      const _e: never = stub;
      return _e;
    }
  }
}

export function blobToPassFile(blob: Blob, serial: string): File {
  return new File([blob], `${serial}.jpg`, { type: "image/jpeg" });
}

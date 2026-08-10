import { JPEG_QUALITY } from "./compose";
import { pickBuilderTitle } from "./builder-titles";
import type { IndiaAirport } from "./india-airports";
import { drawIataBarcodeStrip, drawRouteMotif } from "./route-motifs";
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
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(source, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
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

function drawHalftoneDots(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.fillStyle = "rgba(11,77,44,0.12)";
  for (let row = 0; row < h; row += 12) {
    for (let col = 0; col < w; col += 12) {
      ctx.beginPath();
      ctx.arc(x + col + 2, y + row + 2, (row + col) % 24 === 0 ? 1.5 : 0.9, 0, Math.PI * 2);
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

function drawAccentRail(ctx: CanvasRenderingContext2D, theme: IdTheme, y: number, h = 6) {
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

function drawPerforation(ctx: CanvasRenderingContext2D, y: number) {
  ctx.fillStyle = GREEN_DEEP;
  for (let x = 18; x < ID_WIDTH - 10; x += 20) {
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTitleStamp(
  ctx: CanvasRenderingContext2D,
  theme: IdTheme,
  title: string,
  x: number,
  y: number,
) {
  ctx.font = `700 26px "DM Sans", system-ui, sans-serif`;
  const stampW = Math.min(ID_WIDTH - 80, ctx.measureText(title).width + 36);
  const stampH = 48;
  switch (theme.stampTitle) {
    case "magentaBar":
      ctx.fillStyle = MAGENTA;
      ctx.fillRect(x, y, stampW, stampH);
      ctx.strokeStyle = BLACK;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, stampW, stampH);
      ctx.fillStyle = CREAM;
      break;
    case "yellowOutline":
      ctx.strokeStyle = YELLOW;
      ctx.lineWidth = 5;
      ctx.strokeRect(x, y, stampW, stampH);
      ctx.fillStyle = YELLOW;
      break;
    case "creamChip":
      ctx.fillStyle = CREAM;
      ctx.fillRect(x, y, stampW, stampH);
      ctx.strokeStyle = BLACK;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, stampW, stampH);
      ctx.fillStyle = GREEN;
      break;
    case "flapCell":
      ctx.fillStyle = GREEN_DEEP;
      ctx.fillRect(x, y, stampW, stampH);
      ctx.fillStyle = MAGENTA;
      ctx.fillRect(x, y + stampH / 2 - 1, stampW, 2);
      ctx.strokeStyle = BLACK;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, stampW, stampH);
      ctx.fillStyle = YELLOW;
      break;
    default: {
      const _e: never = theme.stampTitle;
      void _e;
      ctx.fillStyle = CREAM;
    }
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, x + stampW / 2, y + stampH / 2 + 1);
}

function drawStub(
  ctx: CanvasRenderingContext2D,
  theme: IdTheme,
  stubY: number,
  stubH: number,
  serial: string,
  displayName: string,
  displayRole: string,
) {
  ctx.fillStyle = stubFill(theme.stub);
  ctx.fillRect(0, stubY, ID_WIDTH, stubH);
  if (theme.stub === "paper") drawHalftoneDots(ctx, 0, stubY, ID_WIDTH, stubH);
  drawAccentRail(ctx, theme, stubY, theme.accentRail === "dual" ? 5 : 6);
  drawPerforation(ctx, stubY + 2);

  const notch = theme.stub === "magenta" ? "#C41860" : GREEN_DEEP;
  ctx.fillStyle = notch;
  ctx.beginPath();
  ctx.arc(0, stubY + stubH / 2, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ID_WIDTH, stubY + stubH / 2, 22, 0, Math.PI * 2);
  ctx.fill();

  const mid = stubY + stubH / 2;
  const ink = theme.stub === "paper" ? INK : CREAM;
  const muted = theme.stub === "paper" ? GREEN : YELLOW;

  if (theme.nameBlock === "stubOnlyName") {
    ctx.fillStyle = ink;
    ctx.font = `700 30px "Archivo Black", Impact, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(displayName.slice(0, 18), 48, mid - 24);
    ctx.fillStyle = muted;
    ctx.font = `700 15px "DM Sans", system-ui, sans-serif`;
    ctx.fillText(displayRole.slice(0, 28), 48, mid + 8);
    ctx.fillStyle = ink;
    ctx.font = `700 22px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = "right";
    ctx.fillText(serial, ID_WIDTH - 48, mid + 24);
    return;
  }

  ctx.fillStyle = muted;
  ctx.font = `700 16px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("HACKER HOUSE GOA", 48, mid - 28);
  ctx.fillStyle = ink;
  ctx.font = `700 14px "DM Sans", system-ui, sans-serif`;
  ctx.fillText("OCT 28–31  ·  2026", 48, mid - 6);
  ctx.font = `700 26px ui-monospace, SFMono-Regular, Menlo, monospace`;
  ctx.textAlign = "center";
  ctx.fillText(serial, ID_WIDTH / 2, mid + 26);
  ctx.fillStyle = theme.stub === "magenta" ? YELLOW : MAGENTA;
  ctx.font = `700 14px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText("GOI · #FrameInGoa", ID_WIDTH - 48, mid + 8);
}

function photoWash(
  ctx: CanvasRenderingContext2D,
  theme: IdTheme,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (theme.photoTreatment === "clean") {
    const fade = ctx.createLinearGradient(0, y + h * 0.4, 0, y + h);
    fade.addColorStop(0, "rgba(8,56,33,0)");
    fade.addColorStop(1, "rgba(8,56,33,0.85)");
    ctx.fillStyle = fade;
    ctx.fillRect(x, y, w, h);
  } else if (theme.photoTreatment === "greenWash") {
    ctx.fillStyle = "rgba(8,56,33,0.35)";
    ctx.fillRect(x, y, w, h);
    const fade = ctx.createLinearGradient(0, y + h * 0.3, 0, y + h);
    fade.addColorStop(0, "rgba(8,56,33,0)");
    fade.addColorStop(1, "rgba(8,56,33,0.9)");
    ctx.fillStyle = fade;
    ctx.fillRect(x, y, w, h);
  } else if (theme.photoTreatment === "halftoneEdge") {
    const band = Math.min(140, h * 0.28);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y + h - band, w, band);
    ctx.clip();
    drawHalftoneDots(ctx, x, y + h - band, w, band);
    ctx.fillStyle = "rgba(8,56,33,0.55)";
    ctx.fillRect(x, y + h - band, w, band);
    ctx.restore();
  }
}

function drawNameRole(
  ctx: CanvasRenderingContext2D,
  displayName: string,
  displayRole: string,
  x: number,
  nameY: number,
  roleY: number,
  maxW: number,
  align: CanvasTextAlign = "left",
  nameColor: string = CREAM,
) {
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = nameColor;
  const ns = fitText(ctx, displayName, maxW, 76, 36, `"Archivo Black", Impact, sans-serif`);
  ctx.font = `700 ${ns}px "Archivo Black", Impact, sans-serif`;
  ctx.fillText(displayName, x, nameY);
  ctx.fillStyle = MAGENTA;
  const rs = fitText(ctx, displayRole, maxW, 34, 18, `"DM Sans", system-ui, sans-serif`);
  ctx.font = `700 ${rs}px "DM Sans", system-ui, sans-serif`;
  ctx.fillText(displayRole, x, roleY);
}

async function drawPosterStub(
  ctx: CanvasRenderingContext2D,
  input: ComposeIdInput,
  theme: IdTheme,
  title: string,
  displayName: string,
  displayRole: string,
) {
  const stubH = Math.round(ID_HEIGHT * theme.stubHRatio);
  const bodyH = ID_HEIGHT - stubH;

  ctx.fillStyle = GREEN_DEEP;
  ctx.fillRect(0, 0, ID_WIDTH, bodyH);
  coverRect(ctx, input.photo, 0, 0, ID_WIDTH, bodyH);
  photoWash(ctx, theme, 0, 0, ID_WIDTH, bodyH);

  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, ID_WIDTH - 16, bodyH - 16);
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, ID_WIDTH - 40, bodyH - 40);
  drawCornerTicks(ctx, 28, 28, ID_WIDTH - 56, bodyH - 56);

  if (theme.titleMark === "textChip") {
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

  drawRouteMotif(ctx, {
    origin: input.origin,
    x: 40,
    y: 110,
    w: ID_WIDTH - 80,
    h: 88,
    motif: theme.routeMotif,
  });

  drawNameRole(ctx, displayName, displayRole, 40, bodyH - 150, bodyH - 108, ID_WIDTH - 80);
  drawTitleStamp(ctx, theme, title, 40, bodyH - 88);
  drawStub(ctx, theme, bodyH, stubH, input.serial, displayName, displayRole);
}

async function drawBoardingPass(
  ctx: CanvasRenderingContext2D,
  input: ComposeIdInput,
  theme: IdTheme,
  title: string,
  displayName: string,
  displayRole: string,
) {
  const stubH = Math.round(ID_HEIGHT * theme.stubHRatio);
  const bodyH = ID_HEIGHT - stubH;
  const photoW = Math.round(ID_WIDTH * 0.38);

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, ID_WIDTH, bodyH);
  drawHalftoneDots(ctx, photoW, 0, ID_WIDTH - photoW, bodyH);

  coverRect(ctx, input.photo, 0, 0, photoW, bodyH);
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 6;
  ctx.strokeRect(0, 0, photoW, bodyH);
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, photoW - 16, bodyH - 16);

  const rightX = photoW + 28;
  const rightW = ID_WIDTH - photoW - 56;

  ctx.fillStyle = GREEN;
  ctx.fillRect(photoW, 0, ID_WIDTH - photoW, 64);
  ctx.fillStyle = YELLOW;
  ctx.font = `700 22px "Archivo Black", Impact, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("BOARDING PASS  ·  HH GOA 2026", rightX, 32);

  drawRouteMotif(ctx, {
    origin: input.origin,
    x: rightX,
    y: 90,
    w: rightW,
    h: 96,
    motif: "boardingStrip",
  });

  drawNameRole(ctx, displayName, displayRole, rightX, 280, 330, rightW, "left", GREEN);
  drawTitleStamp(ctx, theme, title, rightX, 360);

  ctx.fillStyle = INK;
  ctx.font = `700 14px "DM Sans", system-ui, sans-serif`;
  ctx.fillText("OCT 28–31 2026  ·  GOI", rightX, bodyH - 40);

  drawStub(ctx, theme, bodyH, stubH, input.serial, displayName, displayRole);
}

async function drawManifest(
  ctx: CanvasRenderingContext2D,
  input: ComposeIdInput,
  theme: IdTheme,
  title: string,
  displayName: string,
  displayRole: string,
) {
  const stubH = Math.round(ID_HEIGHT * theme.stubHRatio);
  const bodyH = ID_HEIGHT - stubH;

  ctx.fillStyle = GREEN_DEEP;
  ctx.fillRect(0, 0, ID_WIDTH, bodyH);
  coverRect(ctx, input.photo, 0, 0, ID_WIDTH, bodyH);
  photoWash(ctx, theme, 0, 0, ID_WIDTH, bodyH);

  drawRouteMotif(ctx, {
    origin: input.origin,
    x: 0,
    y: bodyH * 0.52,
    w: ID_WIDTH,
    h: 180,
    motif: "tapeSlash",
  });

  drawNameRole(ctx, displayName, displayRole, 40, bodyH - 160, bodyH - 118, ID_WIDTH - 80);
  drawTitleStamp(ctx, theme, title, 40, bodyH - 96);
  drawStub(ctx, theme, bodyH, stubH, input.serial, displayName, displayRole);
}

async function drawArrivalGate(
  ctx: CanvasRenderingContext2D,
  input: ComposeIdInput,
  theme: IdTheme,
  title: string,
  displayName: string,
  displayRole: string,
  wordmark: HTMLImageElement | null,
) {
  const stubH = Math.round(ID_HEIGHT * theme.stubHRatio);
  const bodyH = ID_HEIGHT - stubH;
  const bannerH = 120;

  ctx.fillStyle = GREEN;
  ctx.fillRect(0, 0, ID_WIDTH, bannerH);
  drawAccentRail(ctx, theme, bannerH - 6, 3);
  if (wordmark) {
    const mw = 220;
    const mh = (mw * wordmark.naturalHeight) / wordmark.naturalWidth;
    ctx.drawImage(wordmark, 36, (bannerH - mh) / 2, mw, mh);
  } else {
    ctx.fillStyle = YELLOW;
    ctx.font = `700 28px "Archivo Black", Impact, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("HACKER HOUSE GOA", 40, bannerH / 2);
  }
  ctx.fillStyle = CREAM;
  ctx.font = `700 16px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText("GATE A1", ID_WIDTH - 40, bannerH / 2);

  coverRect(ctx, input.photo, 0, bannerH, ID_WIDTH, bodyH - bannerH - 160);
  photoWash(ctx, theme, 0, bannerH, ID_WIDTH, bodyH - bannerH - 160);

  drawRouteMotif(ctx, {
    origin: input.origin,
    x: 48,
    y: bodyH - 250,
    w: ID_WIDTH - 96,
    h: 100,
    motif: "splitFlap",
  });

  drawNameRole(ctx, displayName, displayRole, 48, bodyH - 120, bodyH - 78, ID_WIDTH - 96);
  drawTitleStamp(ctx, theme, title, 48, bodyH - 56);
  drawStub(ctx, theme, bodyH, stubH, input.serial, displayName, displayRole);
}

async function drawLanyard(
  ctx: CanvasRenderingContext2D,
  input: ComposeIdInput,
  theme: IdTheme,
  title: string,
  displayName: string,
  displayRole: string,
) {
  const stubH = Math.round(ID_HEIGHT * theme.stubHRatio);
  const bodyH = ID_HEIGHT - stubH;
  const photoH = Math.round(bodyH * 0.55);

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, ID_WIDTH, bodyH);
  drawHalftoneDots(ctx, 0, 0, ID_WIDTH, bodyH);

  // Lanyard hole
  ctx.fillStyle = GREEN_DEEP;
  ctx.beginPath();
  ctx.arc(ID_WIDTH / 2, 36, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 4;
  ctx.stroke();

  const px = 48;
  const py = 64;
  const pw = ID_WIDTH - 96;
  coverRect(ctx, input.photo, px, py, pw, photoH - py);
  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 6;
  ctx.strokeRect(px, py, pw, photoH - py);
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 4;
  ctx.strokeRect(px + 8, py + 8, pw - 16, photoH - py - 16);

  if (theme.titleMark === "textChip") {
    ctx.fillStyle = MAGENTA;
    ctx.fillRect(px, py + 12, 160, 36);
    ctx.fillStyle = CREAM;
    ctx.font = `700 16px "DM Sans", system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("BUILDER", px + 80, py + 30);
  }

  const stackY = photoH + 36;
  drawNameRole(ctx, displayName, displayRole, 56, stackY + 50, stackY + 100, ID_WIDTH - 112, "left", GREEN);
  drawTitleStamp(ctx, theme, title, 56, stackY + 120);

  drawRouteMotif(ctx, {
    origin: input.origin,
    x: 56,
    y: stackY + 190,
    w: ID_WIDTH - 112,
    h: 100,
    motif: "radarHop",
  });

  drawIataBarcodeStrip(ctx, input.origin, 40, bodyH - 48, ID_WIDTH - 80);
  drawStub(ctx, theme, bodyH, stubH, input.serial, displayName, displayRole);
}

async function drawCoastline(
  ctx: CanvasRenderingContext2D,
  input: ComposeIdInput,
  theme: IdTheme,
  title: string,
  displayName: string,
  displayRole: string,
) {
  const stubH = Math.round(ID_HEIGHT * theme.stubHRatio);
  const bodyH = ID_HEIGHT - stubH;

  ctx.fillStyle = GREEN_DEEP;
  ctx.fillRect(0, 0, ID_WIDTH, bodyH);
  coverRect(ctx, input.photo, 0, 0, ID_WIDTH, bodyH);

  // Shoreline wave + halftone
  const shoreY = bodyH - 280;
  ctx.fillStyle = "rgba(8,56,33,0.55)";
  ctx.beginPath();
  ctx.moveTo(0, shoreY + 40);
  for (let x = 0; x <= ID_WIDTH; x += 40) {
    ctx.quadraticCurveTo(x + 20, shoreY + (x % 80 === 0 ? -20 : 30), x + 40, shoreY + 40);
  }
  ctx.lineTo(ID_WIDTH, bodyH);
  ctx.lineTo(0, bodyH);
  ctx.closePath();
  ctx.fill();
  drawHalftoneDots(ctx, 0, shoreY, ID_WIDTH, bodyH - shoreY);

  drawRouteMotif(ctx, {
    origin: input.origin,
    x: 40,
    y: shoreY - 20,
    w: ID_WIDTH - 80,
    h: 120,
    motif: "coastCrest",
  });

  drawTitleStamp(ctx, theme, title, 40, shoreY - 80);
  drawStub(ctx, theme, bodyH, stubH, input.serial, displayName, displayRole);
  // name lives on stub for coastline
  void displayRole;
}

export async function composeBuilderId(input: ComposeIdInput): Promise<{
  blob: Blob;
  title: string;
}> {
  const theme = input.theme ?? ID_THEMES[0]!;
  const title = pickBuilderTitle(input.name, input.serial);
  const displayName = input.name.trim().toUpperCase() || "BUILDER";
  const displayRole = input.role.trim().toUpperCase() || "BUILDER";

  const wordmark =
    theme.titleMark === "wordmarkSVG" ? await loadWordmark() : null;

  const canvas = document.createElement("canvas");
  canvas.width = ID_WIDTH;
  canvas.height = ID_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");

  switch (theme.layout) {
    case "posterStub":
      await drawPosterStub(ctx, input, theme, title, displayName, displayRole);
      break;
    case "boardingPass":
      await drawBoardingPass(ctx, input, theme, title, displayName, displayRole);
      break;
    case "manifest":
      await drawManifest(ctx, input, theme, title, displayName, displayRole);
      break;
    case "arrivalGate":
      await drawArrivalGate(ctx, input, theme, title, displayName, displayRole, wordmark);
      break;
    case "lanyard":
      await drawLanyard(ctx, input, theme, title, displayName, displayRole);
      break;
    case "coastline":
      await drawCoastline(ctx, input, theme, title, displayName, displayRole);
      break;
    default: {
      const _e: never = theme.layout;
      void _e;
    }
  }

  ctx.strokeStyle = BLACK;
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, ID_WIDTH - 8, ID_HEIGHT - 8);

  return { blob: await canvasToJpeg(canvas), title };
}

export function blobToPassFile(blob: Blob, serial: string): File {
  return new File([blob], `${serial}.jpg`, { type: "image/jpeg" });
}

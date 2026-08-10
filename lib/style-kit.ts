/** Brand palette — keep all themes inside these. */
export const BRAND = {
  green: "#0B4D2C",
  deep: "#083821",
  yellow: "#F5C518",
  magenta: "#FF2D8A",
  cream: "#F7F1E6",
  paper: "#F3EDE3",
  ink: "#1A1A1A",
  black: "#111111",
} as const;

export type FrameBg = "green" | "deep" | "creamHalftone";
export type FrameRing =
  | "conicBrand"
  | "solidMagenta"
  | "solidYellow"
  | "splitGreenMagenta";
export type FrameStroke = "cream" | "yellow" | "magenta";
export type FrameArcInk = "cream" | "black";
export type FrameStamp = "outlineMagenta" | "flatYellow" | "boxed";
export type FrameOuter = "none" | "hardSquare" | "ticketNotch";

export type FrameTheme = {
  id: string;
  name: string;
  bg: FrameBg;
  ring: FrameRing;
  innerStroke: FrameStroke;
  arcInk: FrameArcInk;
  stamp: FrameStamp;
  diamonds: boolean;
  outerFrame: FrameOuter;
};

export type IdLayout = "posterStub" | "fullBleedStubThin" | "bannerTop";
export type IdPhotoTreatment = "clean" | "greenWash" | "halftoneEdge";
export type IdAccentRail = "magenta" | "yellow" | "dual";
export type IdTitleMark = "none" | "wordmarkSVG" | "textChip";
export type IdStub = "paper" | "green" | "magenta";
export type IdRouteStyle = "angularYellow" | "dashedCream" | "minimalIata";
export type IdNameBlock = "bottomLeft" | "centerStack" | "stubOnlyName";
export type IdStampTitle = "magentaBar" | "yellowOutline" | "creamChip";

export type IdTheme = {
  id: string;
  name: string;
  layout: IdLayout;
  photoTreatment: IdPhotoTreatment;
  accentRail: IdAccentRail;
  titleMark: IdTitleMark;
  stub: IdStub;
  routeStyle: IdRouteStyle;
  nameBlock: IdNameBlock;
  stampTitle: IdStampTitle;
  stubHRatio: number;
};

export const FRAME_THEMES: readonly FrameTheme[] = [
  {
    id: "ring-classic",
    name: "Classic Ring",
    bg: "green",
    ring: "conicBrand",
    innerStroke: "cream",
    arcInk: "cream",
    stamp: "outlineMagenta",
    diamonds: true,
    outerFrame: "none",
  },
  {
    id: "hot-stub",
    name: "Hot Stub",
    bg: "deep",
    ring: "solidMagenta",
    innerStroke: "yellow",
    arcInk: "cream",
    stamp: "boxed",
    diamonds: true,
    outerFrame: "none",
  },
  {
    id: "sun-field",
    name: "Sun Field",
    bg: "deep",
    ring: "solidYellow",
    innerStroke: "cream",
    arcInk: "black",
    stamp: "flatYellow",
    diamonds: false,
    outerFrame: "none",
  },
  {
    id: "split-signal",
    name: "Split Signal",
    bg: "green",
    ring: "splitGreenMagenta",
    innerStroke: "cream",
    arcInk: "cream",
    stamp: "outlineMagenta",
    diamonds: false,
    outerFrame: "hardSquare",
  },
  {
    id: "cream-halftone",
    name: "Cream Dot",
    bg: "creamHalftone",
    ring: "solidMagenta",
    innerStroke: "yellow",
    arcInk: "black",
    stamp: "boxed",
    diamonds: true,
    outerFrame: "none",
  },
  {
    id: "night-ticket",
    name: "Night Ticket",
    bg: "deep",
    ring: "solidYellow",
    innerStroke: "magenta",
    arcInk: "cream",
    stamp: "outlineMagenta",
    diamonds: true,
    outerFrame: "ticketNotch",
  },
] as const;

export const ID_THEMES: readonly IdTheme[] = [
  {
    id: "poster-stub",
    name: "Poster Stub",
    layout: "posterStub",
    photoTreatment: "clean",
    accentRail: "magenta",
    titleMark: "textChip",
    stub: "paper",
    routeStyle: "angularYellow",
    nameBlock: "bottomLeft",
    stampTitle: "magentaBar",
    stubHRatio: 0.22,
  },
  {
    id: "sunrise-bleed",
    name: "Sunrise Bleed",
    layout: "fullBleedStubThin",
    photoTreatment: "greenWash",
    accentRail: "dual",
    titleMark: "wordmarkSVG",
    stub: "paper",
    routeStyle: "dashedCream",
    nameBlock: "bottomLeft",
    stampTitle: "creamChip",
    stubHRatio: 0.16,
  },
  {
    id: "mecha-banner",
    name: "Mecha Banner",
    layout: "bannerTop",
    photoTreatment: "clean",
    accentRail: "yellow",
    titleMark: "wordmarkSVG",
    stub: "green",
    routeStyle: "angularYellow",
    nameBlock: "bottomLeft",
    stampTitle: "magentaBar",
    stubHRatio: 0.2,
  },
  {
    id: "magenta-stamp",
    name: "Magenta Stamp",
    layout: "posterStub",
    photoTreatment: "clean",
    accentRail: "magenta",
    titleMark: "textChip",
    stub: "magenta",
    routeStyle: "angularYellow",
    nameBlock: "centerStack",
    stampTitle: "yellowOutline",
    stubHRatio: 0.22,
  },
  {
    id: "halftone-dock",
    name: "Halftone Dock",
    layout: "posterStub",
    photoTreatment: "halftoneEdge",
    accentRail: "dual",
    titleMark: "none",
    stub: "paper",
    routeStyle: "dashedCream",
    nameBlock: "bottomLeft",
    stampTitle: "creamChip",
    stubHRatio: 0.22,
  },
  {
    id: "goi-strip",
    name: "GOI Strip",
    layout: "fullBleedStubThin",
    photoTreatment: "greenWash",
    accentRail: "yellow",
    titleMark: "none",
    stub: "green",
    routeStyle: "minimalIata",
    nameBlock: "stubOnlyName",
    stampTitle: "magentaBar",
    stubHRatio: 0.24,
  },
] as const;

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    const j = bytes[0]! % (i + 1);
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

export function pickFrameThemes(n = 5): FrameTheme[] {
  const pool = shuffleInPlace([...FRAME_THEMES]);
  return pool.slice(0, Math.min(n, pool.length));
}

export function pickIdThemes(n = 5): IdTheme[] {
  const pool = shuffleInPlace([...ID_THEMES]);
  return pool.slice(0, Math.min(n, pool.length));
}

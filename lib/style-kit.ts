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

export type FrameLayout =
  | "classic"
  | "sunburst"
  | "stadium"
  | "inset"
  | "orbit"
  | "seal";
export type FrameBg = "green" | "deep" | "creamHalftone";
export type FrameRing =
  | "conicBrand"
  | "solidMagenta"
  | "solidYellow"
  | "splitGreenMagenta";
export type FrameStroke = "cream" | "yellow" | "magenta";
export type FrameArcInk = "cream" | "black";
export type FrameStamp = "outlineMagenta" | "flatYellow" | "boxed";

export type FrameTheme = {
  id: string;
  name: string;
  frameLayout: FrameLayout;
  bg: FrameBg;
  ring: FrameRing;
  innerStroke: FrameStroke;
  arcInk: FrameArcInk;
  stamp: FrameStamp;
  diamonds: boolean;
};

export type IdLayout =
  | "posterStub"
  | "boardingPass"
  | "manifest"
  | "arrivalGate"
  | "lanyard"
  | "coastline";
export type IdPhotoTreatment = "clean" | "greenWash" | "halftoneEdge";
export type IdAccentRail = "magenta" | "yellow" | "dual";
export type IdTitleMark = "none" | "wordmarkSVG" | "textChip";
export type IdStub = "paper" | "green" | "magenta";
export type RouteMotif =
  | "boardingStrip"
  | "splitFlap"
  | "coastCrest"
  | "tapeSlash"
  | "radarHop";
export type IdNameBlock = "bottomLeft" | "centerStack" | "stubOnlyName" | "badgeStack";
export type IdStampTitle = "magentaBar" | "yellowOutline" | "creamChip" | "flapCell";

export type IdTheme = {
  id: string;
  name: string;
  layout: IdLayout;
  photoTreatment: IdPhotoTreatment;
  accentRail: IdAccentRail;
  titleMark: IdTitleMark;
  stub: IdStub;
  routeMotif: RouteMotif;
  nameBlock: IdNameBlock;
  stampTitle: IdStampTitle;
  stubHRatio: number;
};

/** Each theme uses a unique frameLayout. */
export const FRAME_THEMES: readonly FrameTheme[] = [
  {
    id: "ring-classic",
    name: "Classic Ring",
    frameLayout: "classic",
    bg: "green",
    ring: "conicBrand",
    innerStroke: "cream",
    arcInk: "cream",
    stamp: "outlineMagenta",
    diamonds: true,
  },
  {
    id: "sunburst",
    name: "Sunburst",
    frameLayout: "sunburst",
    bg: "deep",
    ring: "solidYellow",
    innerStroke: "cream",
    arcInk: "black",
    stamp: "flatYellow",
    diamonds: false,
  },
  {
    id: "stadium",
    name: "Stadium Badge",
    frameLayout: "stadium",
    bg: "green",
    ring: "conicBrand",
    innerStroke: "cream",
    arcInk: "cream",
    stamp: "boxed",
    diamonds: false,
  },
  {
    id: "inset-tile",
    name: "Inset Tile",
    frameLayout: "inset",
    bg: "creamHalftone",
    ring: "solidMagenta",
    innerStroke: "yellow",
    arcInk: "black",
    stamp: "boxed",
    diamonds: true,
  },
  {
    id: "orbit",
    name: "Orbit",
    frameLayout: "orbit",
    bg: "deep",
    ring: "splitGreenMagenta",
    innerStroke: "yellow",
    arcInk: "cream",
    stamp: "outlineMagenta",
    diamonds: true,
  },
  {
    id: "seal",
    name: "Official Seal",
    frameLayout: "seal",
    bg: "green",
    ring: "solidYellow",
    innerStroke: "magenta",
    arcInk: "cream",
    stamp: "outlineMagenta",
    diamonds: false,
  },
] as const;

/** Each theme uses a unique layout + distinct routeMotif. */
export const ID_THEMES: readonly IdTheme[] = [
  {
    id: "poster-stub",
    name: "Poster Stub",
    layout: "posterStub",
    photoTreatment: "clean",
    accentRail: "magenta",
    titleMark: "textChip",
    stub: "paper",
    routeMotif: "boardingStrip",
    nameBlock: "bottomLeft",
    stampTitle: "magentaBar",
    stubHRatio: 0.2,
  },
  {
    id: "boarding-pass",
    name: "Boarding Pass",
    layout: "boardingPass",
    photoTreatment: "clean",
    accentRail: "dual",
    titleMark: "textChip",
    stub: "paper",
    routeMotif: "boardingStrip",
    nameBlock: "bottomLeft",
    stampTitle: "creamChip",
    stubHRatio: 0.14,
  },
  {
    id: "manifest",
    name: "Flight Manifest",
    layout: "manifest",
    photoTreatment: "greenWash",
    accentRail: "magenta",
    titleMark: "none",
    stub: "paper",
    routeMotif: "tapeSlash",
    nameBlock: "bottomLeft",
    stampTitle: "yellowOutline",
    stubHRatio: 0.18,
  },
  {
    id: "arrival-gate",
    name: "Arrival Gate",
    layout: "arrivalGate",
    photoTreatment: "clean",
    accentRail: "yellow",
    titleMark: "wordmarkSVG",
    stub: "green",
    routeMotif: "splitFlap",
    nameBlock: "bottomLeft",
    stampTitle: "flapCell",
    stubHRatio: 0.18,
  },
  {
    id: "lanyard",
    name: "Lanyard Pass",
    layout: "lanyard",
    photoTreatment: "clean",
    accentRail: "magenta",
    titleMark: "textChip",
    stub: "paper",
    routeMotif: "radarHop",
    nameBlock: "badgeStack",
    stampTitle: "magentaBar",
    stubHRatio: 0.12,
  },
  {
    id: "coastline",
    name: "Coastline",
    layout: "coastline",
    photoTreatment: "halftoneEdge",
    accentRail: "yellow",
    titleMark: "none",
    stub: "green",
    routeMotif: "coastCrest",
    nameBlock: "stubOnlyName",
    stampTitle: "creamChip",
    stubHRatio: 0.2,
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

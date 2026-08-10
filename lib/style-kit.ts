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

/** Colorway only — one shared ID layout. */
export type IdTheme = {
  id: string;
  name: string;
  bg: string;
  stage: string;
  accent: string;
  ink: string;
  muted: string;
  footer: string;
  footerInk: string;
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

/** Same layout; only fills change. */
export const ID_THEMES: readonly IdTheme[] = [
  {
    id: "forest",
    name: "Forest",
    bg: BRAND.green,
    stage: BRAND.cream,
    accent: BRAND.magenta,
    ink: BRAND.green,
    muted: "rgba(11,77,44,0.65)",
    footer: BRAND.deep,
    footerInk: BRAND.cream,
  },
  {
    id: "midnight",
    name: "Midnight",
    bg: BRAND.deep,
    stage: BRAND.paper,
    accent: BRAND.yellow,
    ink: BRAND.deep,
    muted: "rgba(8,56,33,0.65)",
    footer: BRAND.green,
    footerInk: BRAND.yellow,
  },
  {
    id: "cream-pass",
    name: "Cream Pass",
    bg: BRAND.green,
    stage: BRAND.paper,
    accent: BRAND.magenta,
    ink: BRAND.ink,
    muted: "rgba(26,26,26,0.55)",
    footer: BRAND.deep,
    footerInk: BRAND.cream,
  },
  {
    id: "sun-stamp",
    name: "Sun Stamp",
    bg: BRAND.green,
    stage: BRAND.cream,
    accent: BRAND.yellow,
    ink: BRAND.deep,
    muted: "rgba(8,56,33,0.6)",
    footer: BRAND.deep,
    footerInk: BRAND.yellow,
  },
  {
    id: "magenta-field",
    name: "Magenta Field",
    bg: BRAND.magenta,
    stage: BRAND.cream,
    accent: BRAND.yellow,
    ink: BRAND.green,
    muted: "rgba(11,77,44,0.6)",
    footer: BRAND.deep,
    footerInk: BRAND.cream,
  },
  {
    id: "deep-ring",
    name: "Deep Ring",
    bg: BRAND.deep,
    stage: BRAND.cream,
    accent: BRAND.magenta,
    ink: BRAND.ink,
    muted: "rgba(26,26,26,0.55)",
    footer: BRAND.magenta,
    footerInk: BRAND.cream,
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

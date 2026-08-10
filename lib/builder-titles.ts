const TITLES = [
  "Terminal Wizard",
  "Ship Captain",
  "Beach Compiler",
  "Pixel Surfer",
  "Stack Nomad",
  "Latency Surfer",
  "Commit Alchemist",
  "Deploy Diver",
  "Protobuf Poet",
  "Async Astronaut",
  "Kernel Beachbum",
  "TypeScript Typhoon",
  "Infra Islander",
  "Open Source Octopus",
  "CI Surfer",
  "Runtime Rascal",
  "Cache Cowboy",
  "GraphQL Guru",
  "Edge Explorer",
  "Null Island Native",
] as const;

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Stable witty title for a given name + serial. */
export function pickBuilderTitle(name: string, serial: string): string {
  const idx = hashString(`${name.trim().toLowerCase()}|${serial}`) % TITLES.length;
  return TITLES[idx]!;
}

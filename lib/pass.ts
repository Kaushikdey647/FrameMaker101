export type PassRecord = {
  serial: string;
  name: string;
  role: string;
  title: string;
  status: "pending" | "ready";
  createdAt: string;
  imageUrl?: string;
};

export function passJsonPath(serial: string): string {
  return `passes/${serial}.json`;
}

export function passJpgPath(serial: string): string {
  return `passes/${serial}.jpg`;
}

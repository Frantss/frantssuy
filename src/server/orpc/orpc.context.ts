import "@tanstack/solid-start/server-only";
import { isIP } from "node:net";
import type { WorkerServices } from "@/worker/services";

export type Context = WorkerServices & {
  headers: Headers;
  clientIP?: string;
};

export function createContext({
  headers,
  services,
  source = "http",
}: {
  headers: Headers;
  services: WorkerServices;
  source?: "http" | "ssr";
}): Context {
  return {
    headers,
    ...services,
    clientIP: source === "http" ? clientIP(headers) : undefined,
  };
}

function clientIP(headers: Headers): string {
  const address = headers.get("cf-connecting-ip")?.trim();

  if (!address || address.includes("%") || !isIP(address)) return "unknown";
  if (isIP(address) === 4) return address;
  const normalized = new URL(`http://[${address}]`).hostname.slice(1, -1);
  const mapped = /^::ffff:([\da-f]+):([\da-f]+)$/.exec(normalized);

  if (!mapped) return normalized;
  const high = Number.parseInt(mapped[1], 16);
  const low = Number.parseInt(mapped[2], 16);

  return `${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`;
}

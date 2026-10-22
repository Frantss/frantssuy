import type { JSX } from "solid-js";

export function style_merge(
  generated: string | undefined,
  provided: JSX.HTMLAttributes<HTMLElement>["style"],
) {
  if (!generated) return provided;
  if (!provided) return generated;
  if (typeof provided === "string") return `${generated};${provided}`;

  const declarations = Object.entries(provided)
    .filter(([, value]) => value != null)
    .map(([property, value]) => `${property}:${value}`)
    .join(";");

  return `${generated};${declarations}`;
}

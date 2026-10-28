import * as stylex from "@stylexjs/stylex";

export const colors = stylex.defineVars({
  bg: "light-dark(#fafafa, #0a0a0a)",
  surface: "light-dark(#ffffff, #111111)",
  line: "light-dark(#e8e8e8, #232323)",
  lineStrong: "light-dark(#cccccc, #383838)",
  texture: "light-dark(#e0e0e0, #232323)",
  // Bottom edge of raised buttons.
  edge: "light-dark(#bdbdbd, #4a4a4a)",
  accentEdge: "light-dark(#4c1d95, #7c5fd6)",
  fg: "light-dark(#171717, #ededed)",
  muted: "light-dark(#4d4d4d, #a1a1a1)",
  faint: "light-dark(#737373, #7d7d7d)",
  accent: "light-dark(#6d28d9, #a78bfa)",
  onAccent: "light-dark(#ffffff, #0a0a0a)",
  link: "light-dark(#6d28d9, #c4b5fd)",
  accentHover: (): string => `color-mix(in oklab, ${colors.accent} 85%, transparent)`,
  accentTint: (): string => `color-mix(in oklab, ${colors.accent} 10%, transparent)`,
  surfaceHover: (): string => `color-mix(in oklab, ${colors.surface} 94%, ${colors.fg})`,
  liked: "oklch(63.7% 0.237 25.331)",
  live: "light-dark(#15803d, #4ade80)",
});

export const spacing = stylex.defineVars({
  safeBottom: "env(safe-area-inset-bottom)",
  screenReaderOffset: "-1px",
  spaceCvVertical: "12mm",
  spaceCvHorizontal: "14mm",
  space0_5: "0.125rem",
  space1: "0.25rem",
  space1_5: "0.375rem",
  space2: "0.5rem",
  space2_5: "0.625rem",
  space3: "0.75rem",
  space4: "1rem",
  space5: "1.25rem",
  space6: "1.5rem",
  space8: "2rem",
  space12: "3rem",
});

export const typography = stylex.defineVars({
  fontMono:
    '"Geist Mono Variable", ui-monospace, SFMono-Regular, Menlo, Consolas, "Courier New", monospace',
  fontBody: "14px",
  fontXs: "0.75rem",
  fontSm: "0.875rem",
  fontBase: "1rem",
  fontTitle: "1.75rem",
  fontLabel: "10px",
  fontCvLabel: "9px",
  fontCvPrint: "11px",
  fontPrint: "12px",
  leadingBody: "1.6",
  leadingXs: "calc(1 / 0.75)",
  leadingSm: "calc(1.25 / 0.875)",
  leadingBase: "1.5",
  leadingHeading: "1.4",
  leadingTitle: "1.15",
  trackingTitle: "-0.02em",
  trackingLabel: "0.08em",
  trackingButton: "-0.01em",
  leadingPrint: "1.5",
  weightNormal: "400",
  weightMedium: "500",
  weightBold: "700",
});

export const dimensions = stylex.defineVars({
  sizeProse: "60ch",
  sizeCvPage: "210mm",
  sizeLoadError: "24ch",
  sizeSaveError: "28ch",
  sizeMonogram: "2.25rem",
  sizePermalink: "1.25rem",
  sizeLabel: "3rem",
  sizeCvLabel: "7.5rem",
  sizeIconSmall: "0.875rem",
  sizeIcon: "18px",
  sizeScreenReader: "1px",
  sizeFrame: "56rem",
  sizeTexture: "32rem",
  sizeTextureTile: "8px",
  sizeRail: "9rem",
  sizeArticle: "64ch",
  sizeControl: "34px",
  sizeTouch: "2.75rem",
  sizeSmall: "1.5rem",
  sizeDock: "3rem",
  sizeToast: "24rem",
  sizeTooltip: "32ch",
});

export const borders = stylex.defineVars({
  borderRule: "1px",
  borderEmphasis: "2px",
  focusOffset: "2px",
  radiusControl: "3px",
});

export const motion = stylex.defineVars({
  durationColor: "150ms",
  durationFast: "200ms",
  durationDockEnter: "300ms",
  durationEnter: "400ms",
  durationStagger: "60ms",
  easeColor: "cubic-bezier(0.4, 0, 0.2, 1)",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  easeDock: "cubic-bezier(0.32, 0.72, 0, 1)",
});

export const conditions = stylex.defineConsts({
  wide: "@media (width >= 40rem)",
  narrow: "@media (width < 40rem)",
  hover: "@media (hover: hover)",
  coarsePointer: "@media (pointer: coarse)",
  motion: "@media (prefers-reduced-motion: no-preference)",
  reducedMotion: "@media (prefers-reduced-motion: reduce)",
  print: "@media print",
});

export const motionValues = stylex.defineConsts({ themeReveal: 550 });

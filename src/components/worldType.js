// The type of each world's headings (World.jsx): the fonts of the platforms themselves where
// a world is a platform (Learn Git draws in Shantell Sans, Pulse sets in Instrument Serif).

export const FONTS = {
  site: undefined,
  serif: '"Instrument Serif", Georgia, serif',
  marker: '"Shantell Sans", "Segoe Print", cursive',
  rounded: '"Figtree Variable", system-ui, sans-serif',
  mono: '"JetBrains Mono Variable", ui-monospace, monospace',
};

// Headings in the type of their world.
const HEADING = {
  site: "display text-[clamp(2.8rem,5.4vw,5.6rem)]",
  serif: "text-[clamp(3.3rem,6.6vw,7rem)] font-normal leading-[0.94] tracking-[-0.01em]",
  marker: "text-[clamp(2.6rem,5vw,5.2rem)] font-extrabold leading-[1.02] tracking-[-0.01em]",
  rounded: "text-[clamp(2.7rem,5.2vw,5.4rem)] font-extrabold leading-[0.98] tracking-[-0.035em]",
  mono: "text-[clamp(2.3rem,4.4vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.04em]",
};
export function headingProps(world) {
  const font = world.font || "site";
  return { className: HEADING[font] || HEADING.site, style: { fontFamily: FONTS[font] } };
}

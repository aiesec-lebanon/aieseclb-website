import Arrow from "./Arrow";
import { INCOMING_SITE, INCOMING_URL } from "../content/site";

// The way in for someone abroad. The opportunities are listed on AIESEC's global site, so the
// button says where it leads (and it opens there in a new tab). Colours come from className.
export default function ComeToLebanon({ className = "bg-sun text-ink hover:bg-white", style }) {
  return (
    <a
      href={INCOMING_URL}
      target="_blank"
      rel="noreferrer"
      style={style}
      className={`group inline-flex h-14 items-center gap-3 rounded-full px-8 text-lg font-bold transition-colors duration-300 ${className}`}
    >
      Come to Lebanon
      <span className="text-[0.78em] font-semibold opacity-70">on {INCOMING_SITE}</span>
      <Arrow className="transition-transform duration-500 group-hover:translate-x-1.5" />
    </a>
  );
}

import { setSceneryPaused, useSceneryPaused } from "./sceneryPause";

// A small round pause for a moving scene (the opening heroes): the same switch as "Pause the
// scenery" on Events and Platforms, so pausing one pauses all, and it is remembered. Nothing moves
// for anyone who asked for reduced motion, so it is not shown then.
export default function PauseScenery({ className = "" }) {
  const paused = useSceneryPaused();
  return (
    <button
      type="button"
      onClick={() => setSceneryPaused(!paused)}
      aria-pressed={paused}
      aria-label={paused ? "Play the scenery" : "Pause the scenery"}
      className={`grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-night/55 text-white backdrop-blur-md transition-colors hover:bg-night/80 motion-reduce:hidden ${className}`}
    >
      {paused ? (
        <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
          <path d="M4 2.5v11l9-5.5z" />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
          <path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z" />
        </svg>
      )}
    </button>
  );
}

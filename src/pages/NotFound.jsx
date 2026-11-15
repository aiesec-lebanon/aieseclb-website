import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="grid min-h-svh place-items-center bg-night text-white">
      <div className="shell text-center">
        <h1 id="page-title" tabIndex={-1} className="display text-mega outline-none">
          This path ends here.
        </h1>
        <p className="text-lead mx-auto mt-6 max-w-[34rem] text-white/75">
          The page you were looking for is not on this map. The way back is short.
        </p>
        <Link
          to="/"
          viewTransition
          className="mt-10 inline-flex h-14 items-center rounded-full bg-sun px-8 text-lg font-bold text-ink transition-colors hover:bg-white"
        >
          Back to the start
        </Link>
      </div>
    </section>
  );
}

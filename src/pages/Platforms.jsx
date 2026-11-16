import { lazy, Suspense, useSyncExternalStore } from "react";

// The platforms page is two pages: on a large screen the worlds you walk through
// (PlatformsDesktop), on a phone worlds you swipe through (PlatformsMobile). Each is loaded only
// where it is shown, so a phone never downloads the desktop scenery, and the page follows the
// screen if it changes size.
const Desktop = lazy(() => import("./PlatformsDesktop.jsx"));
const Mobile = lazy(() => import("./PlatformsMobile.jsx"));

const QUERY = "(max-width: 767px)";
const subscribe = (onChange) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const isPhone = () => window.matchMedia(QUERY).matches;

export default function Platforms() {
  const phone = useSyncExternalStore(subscribe, isPhone, () => false);
  return <Suspense fallback={<div className="min-h-svh bg-night" />}>{phone ? <Mobile /> : <Desktop />}</Suspense>;
}

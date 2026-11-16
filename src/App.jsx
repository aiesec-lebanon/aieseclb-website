import { useEffect, useLayoutEffect, useRef } from "react";
import { createBrowserRouter, Outlet, RouterProvider, useLocation } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { scrollToSection, scrollToTop, startSmoothScroll, stopSmoothScroll } from "./lib/scroll";
import { NOT_FOUND_META, PAGE_META } from "./content/site";

// the page's own title and description, in the tab and in what a share or a search shows
function setMeta(pathname) {
  const m = PAGE_META[pathname.replace(/\/+$/, "") || "/"] || NOT_FOUND_META;
  document.title = m.title;
  for (const [sel, value] of [
    ['meta[name="description"]', m.description],
    ['meta[property="og:title"]', m.title],
    ['meta[property="og:description"]', m.description],
  ]) {
    const el = document.head.querySelector(sel);
    if (el) el.setAttribute("content", value);
  }
}

function Layout() {
  const location = useLocation();
  const first = useRef(true);

  useEffect(() => {
    startSmoothScroll();
    return stopSmoothScroll;
  }, []);

  // New page: start at the top, and hand focus to its heading so keyboard and screen reader
  // users land in the new content instead of on a link that no longer exists.
  useLayoutEffect(() => {
    setMeta(location.pathname);
  }, [location.pathname]);

  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    // a link to a section of another page: go to the section once the page has arrived
    if (location.hash) {
      scrollToSection(decodeURIComponent(location.hash.slice(1)));
      return;
    }
    scrollToTop();
    document.getElementById("page-title")?.focus({ preventScroll: true });
  }, [location.pathname, location.hash]);

  return (
    <>
      <Nav />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

const page = (loader) => () => loader().then((m) => ({ Component: m.default }));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "lebanon", lazy: page(() => import("./pages/Lebanon.jsx")) },
      { path: "exchange", lazy: page(() => import("./pages/Exchange.jsx")) },
      { path: "events", lazy: page(() => import("./pages/Events.jsx")) },
      { path: "platforms", lazy: page(() => import("./pages/Platforms.jsx")) },
      { path: "stories", lazy: page(() => import("./pages/Stories.jsx")) },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

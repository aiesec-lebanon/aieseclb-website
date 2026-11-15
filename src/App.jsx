import { useEffect, useLayoutEffect, useRef } from "react";
import { createBrowserRouter, Outlet, RouterProvider, useLocation } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { scrollToTop, startSmoothScroll, stopSmoothScroll } from "./lib/scroll";

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
    if (first.current) {
      first.current = false;
      return;
    }
    if (location.hash) return;
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
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}

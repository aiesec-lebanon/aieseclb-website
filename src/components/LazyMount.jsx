import { useEffect, useRef, useState } from "react";

// Holds a place in the page and only mounts its children when the reader is about to reach it.
// Used so the 3D bundle is not downloaded, parsed or run for people who never scroll that far.
export default function LazyMount({ children, minHeight = "60vh", rootMargin = "1200px 0px", className = "", ...rest }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (show) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [show, rootMargin]);
  return (
    <div ref={ref} className={className} style={show ? undefined : { minHeight }} {...rest}>
      {show ? children : null}
    </div>
  );
}

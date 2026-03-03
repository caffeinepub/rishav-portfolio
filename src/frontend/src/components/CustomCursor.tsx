import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const ringPosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const onMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[role='button']") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("select") ||
        target.closest("[data-cursor='pointer']");

      if (isInteractive) {
        dot.classList.add("hovering");
        ring.classList.add("hovering");
      } else {
        dot.classList.remove("hovering");
        ring.classList.remove("hovering");
      }
    };

    const animate = () => {
      // Dot follows cursor directly
      dot.style.left = `${posRef.current.x}px`;
      dot.style.top = `${posRef.current.y}px`;

      // Ring follows with lag
      ringPosRef.current.x += (posRef.current.x - ringPosRef.current.x) * 0.15;
      ringPosRef.current.y += (posRef.current.y - ringPosRef.current.y) * 0.15;
      ring.style.left = `${ringPosRef.current.x}px`;
      ring.style.top = `${ringPosRef.current.y}px`;

      rafRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div id="cursor-dot" ref={dotRef} />
      <div id="cursor-ring" ref={ringRef} />
    </>
  );
}

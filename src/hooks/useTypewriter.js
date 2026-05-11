import { useEffect, useMemo, useState } from "react";

const DEFAULT_SPEED = 28;

export const useTypewriter = (text, instant = false, speed = DEFAULT_SPEED) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const safeText = text ?? "";

  useEffect(() => {
    setVisibleCount(instant ? safeText.length : 0);
  }, [safeText, instant]);

  useEffect(() => {
    if (instant || visibleCount >= safeText.length) return undefined;

    const timer = window.setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 1, safeText.length));
    }, speed);

    return () => window.clearTimeout(timer);
  }, [instant, safeText.length, speed, visibleCount]);

  const displayedText = useMemo(
    () => safeText.slice(0, visibleCount),
    [safeText, visibleCount],
  );

  return {
    displayedText,
    isComplete: visibleCount >= safeText.length,
    revealNow: () => setVisibleCount(safeText.length),
  };
};

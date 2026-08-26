import { useEffect, useRef, useState } from "react";

const TICK_INTERVAL = 1000;

// A custom React hook that provides a countdown timer based on a start time and duration.
export const useCountdown = (
  startedAt: string | Date | null | undefined,
  durationMs: number,
): number | null => {
  const startedAtMs = startedAt ? new Date(startedAt).getTime() : null;

  const calcRemaining = () => {
    if (startedAtMs === null) return null;
    const elapsed = Date.now() - startedAtMs;
    return Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
  };

  const [remaining, setRemaining] = useState(calcRemaining);
  const prevStartedAt = useRef(startedAtMs);

  useEffect(() => {
    // Reset immediately when startedAt changes (new timer or cleared)
    if (prevStartedAt.current !== startedAtMs) {
      prevStartedAt.current = startedAtMs;
      setRemaining(calcRemaining());
    }

    if (startedAtMs === null) return;

    const id = setInterval(() => {
      setRemaining(calcRemaining());
    }, TICK_INTERVAL);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAtMs, durationMs]);

  return remaining;
};

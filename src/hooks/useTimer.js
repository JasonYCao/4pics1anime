import { useState, useEffect, useRef } from "react";

export function useTimer(initial, onEnd) {
  const [time, setTime] = useState(initial);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (running && time > 0) {
      ref.current = setTimeout(() => setTime((t) => t - 1), 1000);
    } else if (running && time === 0) {
      setRunning(false);
      onEnd?.();
    }
    return () => clearTimeout(ref.current);
  }, [running, time]);

  return {
    time,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: (t) => {
      setRunning(false);
      setTime(t ?? initial);
    },
  };
}

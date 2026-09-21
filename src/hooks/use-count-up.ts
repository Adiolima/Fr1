"use client";

import { useEffect, useState, useRef } from "react";

/**
 * Anima um valor numérico com count-up suave.
 * @param target valor alvo
 * @param duration duração em ms (default 800ms)
 * @param decimals casas decimais (default 0)
 * @param start valor inicial (default 0)
 */
export function useCountUp(
  target: number,
  duration = 800,
  decimals = 0,
  start = 0,
): number {
  const [value, setValue] = useState(start);
  const raf = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const from = useRef(start);

  useEffect(() => {
    from.current = 0;
    startTime.current = null;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: ease-out (cubic)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from.current + (target - from.current) * eased;

      setValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.round(current));

      if (progress < 1) {
        raf.current = requestAnimationFrame(animate);
      }
    };

    raf.current = requestAnimationFrame(animate);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, duration, decimals]);

  return value;
}

"use client";

import { useCountUp } from "@/hooks/use-count-up";

interface CountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export function CountUp({
  value,
  duration = 800,
  decimals = 0,
  suffix = "",
  prefix = "",
  className = "",
}: CountUpProps) {
  const animated = useCountUp(value, duration, decimals);

  const formatted =
    decimals > 0
      ? animated.toFixed(decimals)
      : animated.toLocaleString("pt-AO");

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  );
}

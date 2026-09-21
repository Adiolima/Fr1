"use client";

import { useState, useEffect, useRef } from "react";

interface TrialCountdown {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
  expirado: boolean;
  formatted: string;
}

/**
 * Countdown em tempo real até trial_termina_em.
 * Usa setInterval no cliente, sem chamar a API.
 */
export function useTrialCountdown(terminaEm?: string | null): TrialCountdown | null {
  const [countdown, setCountdown] = useState<TrialCountdown | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!terminaEm) {
      setCountdown(null);
      return;
    }

    const calc = () => {
      const diff = new Date(terminaEm).getTime() - Date.now();
      if (diff <= 0) {
        setCountdown({ dias: 0, horas: 0, minutos: 0, segundos: 0, expirado: true, formatted: "Expirado" });
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      const dias = Math.floor(diff / 86400000);
      const horas = Math.floor((diff % 86400000) / 3600000);
      const minutos = Math.floor((diff % 3600000) / 60000);
      const segundos = Math.floor((diff % 60000) / 1000);

      const parts: string[] = [];
      if (dias > 0) parts.push(`${dias} dia${dias !== 1 ? "s" : ""}`);
      if (horas > 0 || dias > 0) parts.push(`${horas}h`);
      parts.push(`${minutos}m`);

      setCountdown({ dias, horas, minutos, segundos, expirado: false, formatted: parts.join(" e ") });
    };

    calc();
    intervalRef.current = setInterval(calc, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [terminaEm]);

  return countdown;
}

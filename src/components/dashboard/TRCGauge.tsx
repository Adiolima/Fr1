"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TRCGaugeProps {
  value: number; // 0-100
}

export function TRCGauge({ value }: TRCGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  let color = "#EF4444"; // vermelho
  let label = "Baixa reciprocidade";
  if (clamped >= 50) {
    color = "#10B981";
    label = "Comunicação bidireccional saudável";
  } else if (clamped >= 25) {
    color = "#F59E0B";
    label = "Comunicação moderada";
  }

  return (
    <Card className="shadow-sm bg-white border-gray-100">
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-sm font-semibold text-gray-900">
          Taxa de Reciprocidade Comunicativa (TRC)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 flex flex-col items-center">
        <div className="relative w-[140px] h-[140px]">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            {/* Fundo */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="10"
            />
            {/* Valor */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-gray-900">
              {clamped.toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="text-[10px] text-gray-500 mt-2 text-center">{label}</p>
      </CardContent>
    </Card>
  );
}

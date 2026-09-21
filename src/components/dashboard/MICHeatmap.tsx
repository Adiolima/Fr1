"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const DIAS_FULL = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];

function heatmapColor(value: number, max: number): string {
  if (max === 0) return "#F9FAFB";
  const intensity = value / max;
  if (intensity === 0) return "#F9FAFB";
  if (intensity < 0.15) return "#E0E7FF";
  if (intensity < 0.30) return "#C7D2FE";
  if (intensity < 0.45) return "#A5B4FC";
  if (intensity < 0.60) return "#818CF8";
  if (intensity < 0.75) return "#6366F1";
  if (intensity < 0.90) return "#4F46E5";
  return "#4338CA";
}

interface MICHeatmapProps {
  data: number[][];
}

export function MICHeatmap({ data }: MICHeatmapProps) {
  const max = useMemo(() => Math.max(...(data?.flat() ?? [0]), 1), [data]);
  const hasData = Array.isArray(data) && data.length === 7 && data[0]?.length === 24;

  // Total por dia
  const totaisPorDia = useMemo(() => {
    if (!hasData) return [];
    return data.map((row) => row.reduce((a, b) => a + b, 0));
  }, [data, hasData]);

  return (
    <Card className="shadow-sm bg-white border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
        <div>
          <CardTitle className="text-sm font-semibold text-gray-900">
            Mapa de Intensidade Comunicativa (MIC)
          </CardTitle>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Distribuição de interacções por dia da semana e hora do dia
          </p>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <span className="text-lg">📊</span>
            </div>
            <p className="text-xs">Sem dados de intensidade comunicativa</p>
          </div>
        ) : (
          <div>
            {/* Cabeçalho de horas */}
            <div className="flex" style={{ paddingLeft: 56 }}>
              {Array.from({ length: 24 }).map((_, h) => (
                <div
                  key={h}
                  className="text-[9px] font-medium text-gray-400 text-center"
                  style={{ width: 28, minWidth: 28 }}
                >
                  {h % 4 === 0 ? `${h}h` : ""}
                </div>
              ))}
              <div className="w-12" />
            </div>

            {/* Grid */}
            <div className="space-y-[2px]">
              {data.map((row, dia) => (
                <div key={dia} className="flex items-center">
                  {/* Label do dia */}
                  <div className="w-[52px] flex items-center gap-2 pr-2 shrink-0">
                    <span className="text-[10px] font-semibold text-gray-500 w-7 text-right">
                      {DIAS[dia]}
                    </span>
                  </div>

                  {/* Células */}
                  <div className="flex gap-[2px]">
                    {row.map((value, hora) => (
                      <Tooltip key={hora} delayDuration={80}>
                        <TooltipTrigger asChild>
                          <div
                            className="rounded-[3px] cursor-pointer transition-all hover:ring-2 hover:ring-indigo-300 hover:scale-110 hover:z-10 relative"
                            style={{
                              width: 26,
                              height: 26,
                              backgroundColor: heatmapColor(value, max),
                              boxShadow: value > 0 ? `0 0 0 1px rgba(99,102,241,0.08)` : "none",
                            }}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs px-2.5 py-1.5">
                          <p className="font-semibold">{DIAS_FULL[dia]}, {hora}h</p>
                          <p className="text-gray-500">{value} interacç{value !== 1 ? "ões" : "ão"}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>

                  {/* Total do dia */}
                  <div className="w-12 text-right shrink-0">
                    <span className="text-[10px] font-semibold text-gray-500 tabular-nums">
                      {totaisPorDia[dia]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Legenda */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-gray-400">0</span>
                <div className="flex gap-[2px]">
                  {[0, 0.15, 0.30, 0.45, 0.60, 0.75, 0.90, 1].map((intensity) => (
                    <div
                      key={intensity}
                      className="rounded-[2px]"
                      style={{
                        width: 18,
                        height: 18,
                        backgroundColor: heatmapColor(intensity * max, max),
                      }}
                    />
                  ))}
                </div>
                <span className="text-[9px] text-gray-400">{max}</span>
              </div>
              <span className="text-[9px] text-gray-400">
                Total: <strong className="text-gray-600">{totaisPorDia.reduce((a, b) => a + b, 0).toLocaleString("pt-AO")}</strong> interacções
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

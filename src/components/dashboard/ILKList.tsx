"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import type { LacunaItemAPI } from "@/services/dashboardService";
import { cn } from "@/lib/utils";

interface ILKListProps {
  lacunas: LacunaItemAPI[];
}

function tempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora mesmo";
  if (mins < 60) return `há ${mins}m`;
  const horas = Math.floor(mins / 60);
  if (horas < 24) return `há ${horas}h`;
  return `há ${Math.floor(horas / 24)}d`;
}

const URGENCIA_COLORS: Record<string, { emoji: string; className: string }> = {
  alta: { emoji: "🔴", className: "bg-red-500/10 text-red-600 border-red-500/20" },
  media: { emoji: "🟡", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  baixa: { emoji: "🟢", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
};

export function ILKList({ lacunas }: ILKListProps) {
  const router = useRouter();

  if (!lacunas || lacunas.length === 0) {
    return (
      <Card className="shadow-sm bg-white border-gray-100">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm font-semibold text-gray-900">
            Índice de Lacunas de Conhecimento (ILK)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <p className="text-xs text-gray-400 text-center py-4">
            Nenhuma lacuna de conhecimento detectada. 🎉
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm bg-white border-gray-100">
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-sm font-semibold text-gray-900">
          Índice de Lacunas de Conhecimento (ILK)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-2">
          {lacunas.map((item, i) => {
            const urg = URGENCIA_COLORS[item.urgencia] ?? URGENCIA_COLORS.baixa;

            return (
              <div
                key={item.tipo_informacao}
                className="flex items-start gap-3 p-2 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-colors"
              >
                <span className="text-xs font-bold text-gray-400 w-5 text-right shrink-0 mt-0.5">
                  #{i + 1}
                </span>

                <span
                  className={cn("text-[9px] px-1.5 py-0.5 rounded border font-medium shrink-0 mt-0.5", urg.className)}
                >
                  {urg.emoji}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-gray-900 truncate">{item.label}</p>
                    <span className="text-[10px] text-gray-400 shrink-0">
                      {item.total_sem_resposta} perguntas
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[9px] text-gray-400 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {tempoRelativo(item.ultima_pergunta_em)}
                  </div>

                  {item.exemplos_perguntas.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.exemplos_perguntas.slice(0, 2).map((ex, j) => (
                        <span
                          key={j}
                          className="text-[9px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded italic truncate max-w-[220px]"
                        >
                          &ldquo;{ex}&rdquo;
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] px-2 gap-1 shrink-0 border-purple-200 text-purple-600 hover:bg-purple-50 cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/memorias/nova?tipo=${encodeURIComponent(item.tipo_informacao)}&titulo=${encodeURIComponent(`Informação sobre ${item.label}`)}&origem=lacuna`,
                    )
                  }
                >
                  <Plus className="w-3 h-3" /> Adicionar
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

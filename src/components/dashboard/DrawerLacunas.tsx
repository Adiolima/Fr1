"use client";

import { useEffect, useState } from "react";
import { X, Brain, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LacunaItemAPI } from "@/services/dashboardService";

interface DrawerLacunasProps {
  aberto: boolean;
  onFechar: () => void;
  lacunas: LacunaItemAPI[];
  assistenteUid: string;
}

function tempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora mesmo";
  if (mins < 60) return `há ${mins} minuto${mins !== 1 ? "s" : ""}`;
  const horas = Math.floor(mins / 60);
  if (horas < 24) return `há ${horas} hora${horas !== 1 ? "s" : ""}`;
  const dias = Math.floor(horas / 24);
  return `há ${dias} dia${dias !== 1 ? "s" : ""}`;
}

const URGENCIA_STYLE: Record<string, { emoji: string; color: string }> = {
  alta: { emoji: "🔴", color: "border-red-200 bg-red-50/30" },
  media: { emoji: "🟡", color: "border-amber-200 bg-amber-50/30" },
  baixa: { emoji: "🟢", color: "border-emerald-200 bg-emerald-50/30" },
};

export function DrawerLacunas({ aberto, onFechar, lacunas, assistenteUid }: DrawerLacunasProps) {
  const [removendo, setRemovendo] = useState<Set<string>>(new Set());

  // Fecha no ESC
  useEffect(() => {
    if (!aberto) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [aberto, onFechar]);

  if (!aberto) return null;

  const handleAdicionar = (lacuna: LacunaItemAPI) => {
    onFechar();
    window.location.href = `/memorias/nova?tipo=${encodeURIComponent(lacuna.tipo_informacao)}&titulo=${encodeURIComponent(`Informação sobre ${lacuna.label}`)}&origem=lacuna`;
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onFechar}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[380px] max-w-[90vw] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Lacunas de Conhecimento</p>
              <p className="text-[10px] text-gray-400">{lacunas.length} tipo{lacunas.length !== 1 ? "s" : ""} identificado{lacunas.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {lacunas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Sem lacunas de conhecimento</p>
              <p className="text-xs text-gray-400 max-w-[240px]">
                O assistente tem toda a informação necessária para responder.
              </p>
            </div>
          ) : (
            lacunas.map((lacuna) => {
              const style = URGENCIA_STYLE[lacuna.urgencia] ?? URGENCIA_STYLE.baixa;
              const isRemoving = removendo.has(lacuna.tipo_informacao);

              return (
                <div
                  key={lacuna.tipo_informacao}
                  className={cn(
                    "p-3 rounded-xl border transition-all duration-300",
                    style.color,
                    isRemoving && "opacity-0 translate-x-full",
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{style.emoji}</span>
                      <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                        {lacuna.label}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        "text-[9px] h-4 px-1.5 font-medium border",
                        lacuna.urgencia === "alta"
                          ? "bg-red-100 text-red-600 border-red-200"
                          : lacuna.urgencia === "media"
                            ? "bg-amber-100 text-amber-600 border-amber-200"
                            : "bg-emerald-100 text-emerald-600 border-emerald-200",
                      )}
                    >
                      {lacuna.urgencia}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <p className="text-xs text-gray-700 mb-1">
                    <strong>{lacuna.total_sem_resposta}</strong> perguntas sem resposta
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2">
                    <Clock className="w-3 h-3" />
                    Última: {tempoRelativo(lacuna.ultima_pergunta_em)}
                  </div>

                  {/* Exemplos */}
                  {lacuna.exemplos_perguntas.length > 0 && (
                    <div className="mb-3">
                      <p className="text-[9px] text-gray-400 mb-1">Exemplos:</p>
                      <div className="space-y-1">
                        {lacuna.exemplos_perguntas.slice(0, 3).map((ex, j) => (
                          <p
                            key={j}
                            className="text-[10px] text-gray-500 italic bg-white/60 px-2 py-1 rounded border border-gray-100"
                          >
                            &ldquo;{ex}&rdquo;
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Botão Adicionar */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-[11px] gap-1.5 border-purple-200 text-purple-600 hover:bg-purple-50 cursor-pointer"
                    onClick={() => handleAdicionar(lacuna)}
                  >
                    <span>+</span> Adicionar esta informação
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

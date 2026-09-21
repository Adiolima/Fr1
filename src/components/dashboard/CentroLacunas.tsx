"use client";

import { cn } from "@/lib/utils";
import type { LacunasAPI } from "@/services/dashboardService";

interface CentroLacunasProps {
  lacunas: LacunasAPI;
  onClick?: () => void;
}

function urgenciaMaxima(lista: LacunasAPI["lista"]): "alta" | "media" | "baixa" | "zero" {
  if (!lista || lista.length === 0) return "zero";
  if (lista.some((l) => l.urgencia === "alta")) return "alta";
  if (lista.some((l) => l.urgencia === "media")) return "media";
  return "baixa";
}

const CORES: Record<string, string> = {
  alta: "#EF4444",
  media: "#FFB347",
  baixa: "#00C9A7",
  zero: "#9CA3AF",
};

export function CentroLacunas({ lacunas, onClick }: CentroLacunasProps) {
  const total = lacunas?.total_tipos ?? 0;
  const urgencia = urgenciaMaxima(lacunas?.lista ?? []);
  const cor = CORES[urgencia];
  const temPulse = urgencia === "alta" || urgencia === "media";

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
      title={`${total} lacuna${total !== 1 ? "s" : ""} de conhecimento`}
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2.5 w-2.5">
        {temPulse && (
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{
              backgroundColor: cor,
              animation: `pulse-lacuna ${urgencia === "alta" ? "2s" : "3s"} infinite`,
            }}
          />
        )}
        <span
          className="relative inline-flex rounded-full h-2.5 w-2.5"
          style={{ backgroundColor: cor }}
        />
      </span>

      {/* Number + label */}
      <span className="flex items-baseline gap-1">
        <span className="text-sm font-bold text-gray-900 tabular-nums">{total}</span>
        <span className="text-[11px] font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
          lacuna{total !== 1 ? "s" : ""}
        </span>
      </span>

      <style jsx>{`
        @keyframes pulse-lacuna {
          0% { transform: scale(1); opacity: 0.75; }
          50% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(1); opacity: 0.75; }
        }
      `}</style>
    </button>
  );
}

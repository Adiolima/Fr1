"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrpItemAPI } from "@/services/dashboardService";

const PERFIL_LABELS: Record<string, string> = {
  encarregado: "Encarregados",
  aluno: "Alunos",
  professor: "Professores",
  funcionario: "Funcionários",
};

const PERFIL_COLORS: Record<string, string> = {
  encarregado: "bg-blue-500",
  aluno: "bg-purple-500",
  professor: "bg-emerald-500",
  funcionario: "bg-amber-500",
};

interface TRPBarsProps {
  trp: TrpItemAPI[];
}

export function TRPBars({ trp }: TRPBarsProps) {
  if (!trp || trp.length === 0) {
    return (
      <Card className="shadow-sm bg-white border-gray-100">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm font-semibold text-gray-900">
            Taxa de Resolução por Perfil (TRP)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <p className="text-xs text-gray-400 text-center py-4">Sem dados disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...trp].sort((a, b) => b.tr_pct - a.tr_pct);

  return (
    <Card className="shadow-sm bg-white border-gray-100">
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-sm font-semibold text-gray-900">
          Taxa de Resolução por Perfil (TRP)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2.5">
        {sorted.map((item) => {
          const color = PERFIL_COLORS[item.perfil] ?? "bg-gray-400";
          const label = PERFIL_LABELS[item.perfil] ?? item.perfil;

          let textColor = "text-emerald-600";
          if (item.tr_pct < 70) textColor = "text-red-500";
          else if (item.tr_pct < 85) textColor = "text-amber-500";

          return (
            <div key={item.perfil}>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-600">{label}</span>
                <span className={`text-xs font-bold ${textColor}`}>
                  {item.tr_pct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`${color} h-full rounded-full transition-all duration-700 ease-out`}
                  style={{ width: `${Math.min(item.tr_pct, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

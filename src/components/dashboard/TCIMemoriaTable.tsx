"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TciMemoriaAPI } from "@/services/dashboardService";

interface TCIMemoriaTableProps {
  memorias: TciMemoriaAPI[];
}

function tciBadge(tci: number) {
  if (tci >= 70) return { label: "Alta", color: "bg-emerald-50 text-emerald-600 border-emerald-200" };
  if (tci >= 30) return { label: "Média", color: "bg-amber-50 text-amber-600 border-amber-200" };
  return { label: "Baixa", color: "bg-red-50 text-red-600 border-red-200" };
}

export function TCIMemoriaTable({ memorias }: TCIMemoriaTableProps) {
  if (!memorias || memorias.length === 0) {
    return (
      <Card className="shadow-sm bg-white border-gray-100">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-sm font-semibold text-gray-900">TCI por Memória</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <p className="text-xs text-gray-400 text-center py-4">Sem dados disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm bg-white border-gray-100">
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-sm font-semibold text-gray-900">TCI por Memória</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] text-gray-400 bg-gray-50/50 uppercase border-b border-gray-100">
              <th className="px-3 py-2 text-left font-medium">Título</th>
              <th className="px-3 py-2 text-center font-medium">Interacções</th>
              <th className="px-3 py-2 text-center font-medium">Resolvidas</th>
              <th className="px-3 py-2 text-center font-medium">Contactos</th>
              <th className="px-3 py-2 text-center font-medium">Relevância</th>
              <th className="px-3 py-2 text-left font-medium">TCI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {memorias.map((m) => {
              const badge = tciBadge(m.tci_pct);
              return (
                <tr key={m.memoria_id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-3 py-2.5 font-medium text-gray-900 max-w-[200px] truncate">
                    {m.titulo}
                  </td>
                  <td className="px-3 py-2.5 text-center text-gray-600">
                    {m.total_interacoes}
                  </td>
                  <td className="px-3 py-2.5 text-center text-gray-600">
                    {m.interacoes_resolvidas}
                  </td>
                  <td className="px-3 py-2.5 text-center text-gray-600">
                    {m.contactos_unicos}
                  </td>
                  <td className="px-3 py-2.5 text-center text-gray-600">
                    {(m.relevancia_media * 100).toFixed(0)}%
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[9px] h-4 px-1.5 font-medium border ${badge.color}`}>
                        {badge.label}
                      </Badge>
                      <span className="text-gray-900 font-bold">
                        {m.tci_pct.toFixed(1)}%
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden max-w-[80px]">
                        <div
                          className={`h-full rounded-full ${
                            m.tci_pct >= 70
                              ? "bg-emerald-500"
                              : m.tci_pct >= 30
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(m.tci_pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

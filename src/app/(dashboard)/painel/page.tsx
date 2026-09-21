"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  TrendingUp, Users, CheckCircle2, Zap,
  Star, AlertCircle, AlertTriangle, Rocket, Sparkles, RefreshCw,
  Loader2,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { getDashboardPrincipal, type DashboardPrincipal } from "@/services/dashboardService";
import { useCountUp } from "@/hooks/use-count-up";
import { useSSE, type SSEEvento } from "@/hooks/use-sse";
import { DashboardPrincipalSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { StarRating } from "@/components/dashboard/StarRating";

/* ─── Cores ─── */

const DONUT_COLORS = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];

/* ─── Feed de Actividade ─── */

interface FeedItem {
  id: string;
  tipo: "mensagem" | "resposta" | "comunicado";
  nome: string;
  msg: string;
  time: string;
  initial: string;
  color: string;
}

function atividadeFeed(): FeedItem[] {
  return [
    { id: "0", tipo: "mensagem", nome: "Aluno - 10ªA", msg: "Qual é a data da próxima prova de Matemática?", time: "agora", initial: "A", color: "bg-blue-500" },
    { id: "1", tipo: "mensagem", nome: "Pai - 6ºB", msg: "Como posso emitir a segunda via do boleto?", time: "1m", initial: "P", color: "bg-purple-500" },
    { id: "2", tipo: "resposta", nome: "Professor - História", msg: "Enviou o comunicado: Trabalho de Pesquisa", time: "2m", initial: "P", color: "bg-emerald-500" },
    { id: "3", tipo: "mensagem", nome: "Aluno - 8ºC", msg: "Como justificar uma falta?", time: "3m", initial: "A", color: "bg-blue-500" },
    { id: "4", tipo: "comunicado", nome: "Director", msg: "Comunicado geral: Reunião de Pais", time: "5m", initial: "D", color: "bg-amber-500" },
  ];
}

const INITIAL_COLORS = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500"];

/* ─── Componente de Stat Card ─── */

interface StatCardData {
  icon: React.ElementType;
  label: string;
  rawValue: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  subValue?: string;
  subPositive?: boolean;
  desc: string;
  color: string;
  bg: string;
  alerta?: boolean;
  stars?: boolean;
  starVal?: number;
  starTotal?: number;
}

function StatCard({
  icon: Icon,
  label,
  rawValue,
  suffix = "",
  prefix = "",
  decimals = 1,
  subValue,
  subPositive,
  desc,
  color,
  bg,
  alerta,
  stars,
  starVal,
  starTotal,
  periodo,
}: StatCardData & { periodo: string }) {
  const animated = useCountUp(rawValue, 800, decimals);

  const formatted =
    decimals > 0
      ? animated.toFixed(decimals)
      : animated.toLocaleString("pt-AO");

  return (
    <Card className={`shadow-sm bg-white border-gray-100 ${alerta ? "border-amber-300" : ""}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className={`p-1.5 rounded-md ${bg}`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <span className="text-[9px] uppercase font-semibold text-gray-400 tracking-wide">
            {periodo === "semana" ? "Esta semana" : periodo === "mes" ? "Este mês" : "Este trimestre"}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 mb-0.5">
          <h3 className="text-2xl font-bold leading-none text-gray-900">
            {prefix}{formatted}{suffix}
          </h3>
          {subValue && (
            <span
              className={`text-[10px] font-medium flex items-center ${
                subPositive ? "text-emerald-500" : "text-red-400"
              }`}
            >
              <TrendingUp
                className={`w-2.5 h-2.5 mr-0.5 ${!subPositive ? "rotate-180" : ""}`}
              />
              {subValue}
            </span>
          )}
        </div>
        <p className="text-xs font-medium text-gray-700 mb-2">{label}</p>
        {stars && starVal !== undefined ? (
          <StarRating value={starVal} total={starTotal} size="sm" />
        ) : (
          <div className="text-[10px] text-gray-400 flex flex-wrap gap-x-2 gap-y-0.5">
            {desc.split(" · ").map((d, j) => (
              <span key={j}>{d}</span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Página ─── */

export default function PainelPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardPrincipal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<"semana" | "mes" | "trimestre">("semana");
  const [feed, setFeed] = useState<FeedItem[]>(() => atividadeFeed());
  const feedCounter = useRef(5);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardPrincipal(periodo);
      setDashboard(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.erro ||
        err?.response?.data?.mensagem ||
        err?.message ||
        "Erro ao carregar métricas.";
      setError(msg);
      toast.error("Erro ao carregar métricas", {
        description: msg,
        action: {
          label: "Tentar novamente",
          onClick: () => fetch(),
        },
      });
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  /* ─── SSE ─── */
  useSSE(
    useCallback((evento: SSEEvento) => {
      if (evento.tipo === "nova_mensagem") {
        const id = String(++feedCounter.current);
        const initial = evento.contacto_tipo?.charAt(0).toUpperCase() ?? "C";
        setFeed((prev) => {
          const item: FeedItem = {
            id,
            tipo: "mensagem",
            nome: evento.contacto_tipo ?? "Contacto",
            msg: evento.preview ?? "",
            time: "agora",
            initial,
            color: INITIAL_COLORS[Math.floor(Math.random() * INITIAL_COLORS.length)],
          };
          return [item, ...prev.slice(0, 4)];
        });
      }

      if (evento.tipo === "trial_expirado") {
        toast("Trial expirado", {
          description: `O assistente ${evento.assistente_id} atingiu o limite do período de trial.`,
          duration: Infinity,
          action: { label: "Ver planos", onClick: () => router.push("/planos") },
        });
      }

      if (evento.tipo === "lacuna_detectada") {
        toast(`${evento.total} encarregados perguntaram sobre ${evento.tipo_informacao} sem resposta.`, {
          description: "Adicionar conhecimento →",
          duration: 8000,
          action: {
            label: "Adicionar",
            onClick: () =>
              router.push(`/memorias/nova?tipo=${encodeURIComponent(evento.tipo_informacao)}`),
          },
        });
      }

      if (evento.tipo === "qualidade_caiu") {
        const queda = evento.tr_anterior - evento.tr_actual;
        toast.warning("Qualidade de resposta caiu", {
          description: `A TR do assistente caiu ${queda.toFixed(1)} pontos percentuais.`,
        });
      }

      if (evento.tipo === "comunicado_concluido") {
        toast.success("Comunicado concluído", {
          description: `TCI final: ${evento.tci_pct.toFixed(1)}%`,
        });
      }
    }, [router]),
  );

  /* ─── Loading State ─── */
  if (loading && !dashboard) {
    return <DashboardPrincipalSkeleton />;
  }

  /* ─── Error State ─── */
  if (error && !dashboard) {
    return (
      <div className="p-4 max-w-[1600px] mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">Erro ao carregar métricas</p>
          <p className="text-xs text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetch} variant="outline" size="sm" className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  const d = dashboard;

  /* ─── Stat Cards ─── */
  const tr = d?.tr;
  const tci = d?.tci;
  const tra = d?.tra;
  const satisfacao = d?.satisfacao;
  const utilizadores = d?.utilizadores_activos;

  const statCards: StatCardData[] = [
    {
      icon: CheckCircle2,
      label: "Taxa de Resolução (TR)",
      rawValue: tr?.valor ?? 0,
      suffix: "%",
      subValue: tr ? `${tr.variacao_pct > 0 ? "↑" : "↓"} ${Math.abs(tr.variacao_pct).toFixed(1)} pp` : "",
      subPositive: tr ? tr.variacao_pct >= 0 : true,
      desc: tr ? `${tr.respondidas} respondidas · ${tr.encaminhadas} encaminhadas` : "",
      color: tr ? (tr.valor >= 85 ? "text-emerald-500" : tr.valor >= 70 ? "text-amber-500" : "text-red-500") : "text-purple-500",
      bg: tr ? (tr.valor >= 85 ? "bg-emerald-500/10" : tr.valor >= 70 ? "bg-amber-500/10" : "bg-red-500/10") : "bg-purple-500/10",
    },
    {
      icon: TrendingUp,
      label: "Taxa de Controlo Informativo (TCI)",
      rawValue: tci?.valor ?? 0,
      suffix: "%",
      subValue: tci ? `${tci.variacao_pct > 0 ? "↑" : "↓"} ${Math.abs(tci.variacao_pct).toFixed(1)} pp` : "",
      subPositive: tci ? tci.variacao_pct >= 0 : true,
      desc: tci ? `Via comunicado ${tci.via_comunicado.toFixed(0)}% · Via assistente ${tci.via_assistente.toFixed(0)}%` : "",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      icon: Zap,
      label: "Taxa de Resposta Autónoma (TRA)",
      rawValue: tra?.valor ?? 0,
      suffix: "%",
      subValue: tra ? `${tra.variacao_pct > 0 ? "↑" : "↓"} ${Math.abs(tra.variacao_pct).toFixed(1)} pp` : "",
      subPositive: tra ? tra.variacao_pct >= 0 : true,
      desc: tra ? `${tra.horas_poupadas.toFixed(0)}h poupadas este mês` : "",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      icon: Users,
      label: "Utilizadores Activos",
      rawValue: utilizadores?.total ?? 0,
      decimals: 0,
      subValue: utilizadores ? `${utilizadores.variacao_pct > 0 ? "↑" : "↓"} ${Math.abs(utilizadores.variacao_pct).toFixed(1)}%` : "",
      subPositive: utilizadores ? utilizadores.variacao_pct >= 0 : true,
      desc: utilizadores
        ? `${utilizadores.encarregados} enc. · ${utilizadores.alunos} alunos · ${utilizadores.professores} prof.`
        : "",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      icon: Star,
      label: "Satisfação Geral",
      rawValue: satisfacao?.valor ?? 0,
      suffix: "/5",
      desc: "",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      stars: true,
      starVal: satisfacao?.valor ?? 0,
      starTotal: satisfacao?.total_avaliacoes ?? 0,
    },
  ];

  /* ─── Render ─── */
  return (
    <div className="p-4 max-w-[1600px] mx-auto space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 py-1">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Painel Principal
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Visão geral de todas as métricas da sua escola.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Período Selector */}
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as typeof periodo)}
            className="h-8 text-xs border-gray-200 bg-white px-3 text-gray-600 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          >
            <option value="semana">Esta semana</option>
            <option value="mes">Este mês</option>
            <option value="trimestre">Este trimestre</option>
          </select>
          <Button
            variant="outline"
            className="h-8 text-xs border-gray-200 bg-white px-3 text-gray-600"
            onClick={fetch}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            )}
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-3">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} periodo={periodo} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-4 gap-3">
        {/* Gráfico de Linha */}
        <Card className="col-span-2 shadow-sm bg-white border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
            <CardTitle className="text-sm font-semibold text-gray-900">
              Visão Geral de Comunicações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={d?.grafico_linha ?? []}
                  margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="data"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderColor: "#e5e7eb",
                      borderRadius: "6px",
                      fontSize: "11px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="entregues"
                    name="Entregues"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="lidas"
                    name="Lidas"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="interacoes"
                    name="Interacções"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-gray-100">
              {[
                { color: "bg-purple-500", label: "Entregues" },
                { color: "bg-blue-500", label: "Lidas" },
                { color: "bg-emerald-500", label: "Interacções" },
              ].map((m, i) => (
                <div key={i}>
                  <p className="text-[10px] text-gray-400 mb-0.5 flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.color}`} />{" "}
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Tipo */}
        <Card className="shadow-sm bg-white border-gray-100">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-sm font-semibold text-gray-900">
              Distribuição por Tipo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 flex flex-col items-center">
            <div className="h-[160px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={d?.distribuicao_tipo ?? []}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="total"
                    stroke="none"
                    nameKey="tipo"
                  >
                    {(d?.distribuicao_tipo ?? []).map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderColor: "#e5e7eb",
                      borderRadius: "6px",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[9px] text-gray-400">Total</span>
                <span className="text-base font-bold text-gray-900">
                  {d?.distribuicao_tipo?.reduce((acc, t) => acc + t.total, 0).toLocaleString("pt-AO") ?? "—"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 w-full mt-1">
              {(d?.distribuicao_tipo ?? []).map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                  />
                  <div>
                    <p className="text-[9px] text-gray-400 leading-tight truncate">{item.tipo}</p>
                    <p className="text-[10px] font-semibold text-gray-900">
                      {item.total}{" "}
                      <span className="font-normal text-gray-400">{item.pct.toFixed(1)}%</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card className="shadow-sm bg-white border-gray-100 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-0">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              Alertas
              {d?.alertas && d.alertas.length > 0 && (
                <span className="bg-red-100 text-red-500 text-[9px] px-1.5 py-0.5 rounded font-bold">
                  {d.alertas.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 flex-1">
            {!d?.alertas || d.alertas.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">Nenhum alerta activo.</p>
            ) : (
              <div className="space-y-2.5 mt-1">
                {d.alertas.slice(0, 5).map((alert, i) => {
                  const Icon =
                    alert.prioridade === "alta"
                      ? AlertCircle
                      : alert.prioridade === "media"
                        ? AlertTriangle
                        : TrendingUp;
                  const colorMap = {
                    alta: { color: "text-red-500", bg: "bg-red-500/10" },
                    media: { color: "text-amber-500", bg: "bg-amber-500/10" },
                    baixa: { color: "text-blue-500", bg: "bg-blue-500/10" },
                  };
                  const { color, bg } = colorMap[alert.prioridade];
                  return (
                    <div key={i} className="flex items-start gap-2 group cursor-pointer">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${bg}`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-gray-700 leading-snug group-hover:text-purple-600 transition-colors">
                          {alert.mensagem}
                        </p>
                        <p className="text-[9px] text-gray-400 mt-0.5">
                          {new Date(alert.criado_em).toLocaleDateString("pt-AO", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom: 3 columns */}
      <div className="grid grid-cols-3 gap-3">
        {/* Top Perguntas */}
        <Card className="shadow-sm bg-white border-gray-100 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
            <CardTitle className="text-sm font-semibold text-gray-900">
              Top Perguntas ({periodo === "semana" ? "Esta semana" : periodo === "mes" ? "Este mês" : "Este trimestre"})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 flex-1 flex flex-col">
            {!d?.top_perguntas || d.top_perguntas.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">Sem dados disponíveis</p>
            ) : (
              <>
                <div className="space-y-2.5 flex-1">
                  {d.top_perguntas.map((item, i) => {
                    const max = d.top_perguntas[0]?.total ?? 1;
                    const pct = (item.total / max) * 100;
                    return (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-700">{item.label}</span>
                          <span className="text-xs text-gray-400 font-semibold">{item.total}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-purple-500 h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-[10px] text-gray-400">Total de Perguntas</span>
                  <span className="text-sm font-bold text-gray-900">
                    {d.top_perguntas.reduce((acc, t) => acc + t.total, 0)}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Feed de Actividade ao Vivo */}
        <Card className="shadow-sm bg-white border-gray-100 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Actividade ao Vivo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 flex-1">
            <div className="space-y-2">
              {feed.map((item) => (
                <div key={item.id} className="flex gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${item.color}`}
                  >
                    {item.initial}
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-md px-2 py-1.5 border border-gray-100 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[10px] font-bold text-gray-700 truncate">
                        {item.nome}
                      </span>
                      <span className="text-[9px] text-gray-400 shrink-0 ml-1">{item.time}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{item.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Impacto */}
        <Card className="shadow-sm bg-gradient-to-br from-purple-50 via-white to-violet-50 border-purple-200 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Rocket className="w-24 h-24 text-purple-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-1 relative z-10">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Impacto Gerado
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 flex-1 flex flex-col relative z-10">
            {d?.impacto ? (
              <>
                <div className="grid grid-cols-2 gap-2 flex-1">
                  {[
                    {
                      val: d.impacto.perguntas_respondidas.toLocaleString("pt-AO"),
                      color: "text-purple-600",
                      label: "Perguntas respondidas",
                    },
                    {
                      val: d.impacto.atendimentos_evitados.toLocaleString("pt-AO"),
                      color: "text-cyan-500",
                      label: "Atendimentos evitados",
                    },
                    {
                      val: `${d.impacto.horas_poupadas.toFixed(0)}h`,
                      color: "text-emerald-500",
                      label: "Horas poupadas",
                    },
                    {
                      val: d.impacto.interacoes_comunicados.toLocaleString("pt-AO"),
                      color: "text-blue-600",
                      label: "Interacções via comunicados",
                    },
                  ].map((m, j) => (
                    <div
                      key={j}
                      className="bg-white/80 backdrop-blur-sm border border-gray-200 p-2 rounded-lg"
                    >
                      <h4 className={`text-lg font-bold mb-0.5 ${m.color}`}>{m.val}</h4>
                      <span className="text-[9px] text-gray-500 font-medium leading-tight block">
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 bg-emerald-50 border border-emerald-200 text-emerald-700 py-1.5 px-2 rounded-lg flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 shrink-0" />
                  <span className="text-[10px] font-semibold">
                    {d.impacto.horas_poupadas > 0
                      ? `Redução significativa na carga de trabalho da secretaria`
                      : "Monitorize as métricas para ver o impacto"}
                  </span>
                </div>
              </>
            ) : (
              <div className="space-y-3 py-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comunicados Recentes */}
      <div className="pb-4">
        <Card className="shadow-sm bg-white border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between p-3 pb-2 border-b border-gray-100">
            <CardTitle className="text-sm font-semibold text-gray-900">
              Comunicados Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {!d?.comunicados_recentes || d.comunicados_recentes.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                Nenhum comunicado recente.
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="text-[10px] text-gray-400 bg-gray-50/50 uppercase border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-2 font-medium">Nome</th>
                    <th className="px-3 py-2 font-medium">Tipo</th>
                    <th className="px-3 py-2 font-medium">Data</th>
                    <th className="px-3 py-2 font-medium">Entregue</th>
                    <th className="px-3 py-2 font-medium">Lido</th>
                    <th className="px-3 py-2 font-medium">TCI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {d.comunicados_recentes.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-gray-900">{row.nome}</td>
                      <td className="px-3 py-2.5 text-gray-500">{row.tipo}</td>
                      <td className="px-3 py-2.5 text-gray-400">
                        {new Date(row.data).toLocaleDateString("pt-AO", { day: "numeric", month: "short" })}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-600 font-medium">{row.entregue_pct.toFixed(1)}%</span>
                          <div className="w-12 bg-gray-100 rounded-full h-1 overflow-hidden">
                            <div
                              className="bg-blue-500 h-full rounded-full"
                              style={{ width: `${Math.min(row.entregue_pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-600 font-medium">{row.lido_pct.toFixed(1)}%</span>
                          <div className="w-12 bg-gray-100 rounded-full h-1 overflow-hidden">
                            <div
                              className="bg-purple-500 h-full rounded-full"
                              style={{ width: `${Math.min(row.lido_pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge
                          className={`text-[9px] h-4 px-1.5 font-medium border ${
                            row.tci_pct >= 85
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : row.tci_pct >= 50
                                ? "bg-amber-50 text-amber-600 border-amber-200"
                                : "bg-red-50 text-red-600 border-red-200"
                          }`}
                        >
                          {row.tci_pct.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

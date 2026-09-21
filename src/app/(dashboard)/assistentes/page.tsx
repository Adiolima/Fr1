"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Plus, ArrowRight, Loader2, X, AlertTriangle, RefreshCw,
  MessageSquare, Clock, Shield, Globe, Cpu, Thermometer, Hash,
  Wifi, WifiOff, Activity,
} from "lucide-react";
import {
  getAssistentes,
  type Assistente,
} from "@/services/assistenteService";
import { useAuth } from "@/components/auth/auth-provider";
import { isAdmin as isAdminPapel } from "@/lib/papeis";
import { CriarAssistenteBaseWizard } from "@/components/assistente/CriarAssistenteBaseWizard";

/* ─── Helpers ─── */

function statusBadge(ativo: boolean, conexaoStatus: string) {
  if (!ativo) return { label: "Inativo", color: "bg-muted text-muted-foreground" as const, icon: Activity };
  if (conexaoStatus === "activa") return { label: "Online", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" as const, icon: Wifi };
  if (conexaoStatus === "pendente") return { label: "Pendente", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" as const, icon: WifiOff };
  return { label: "Offline", color: "bg-red-500/10 text-red-500 border-red-500/20" as const, icon: WifiOff };
}

function modoAcessoLabel(modo: string) {
  return modo === "restrito" ? "Restrito" : "Aberto";
}

function modoAcessoIcon(modo: string) {
  return modo === "restrito" ? Shield : Globe;
}

/* ─── Página Principal ─── */

export default function AssistentesPage() {
  const [assistentes, setAssistentes] = useState<Assistente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();
  const isAdmin = isAdminPapel(user);
  const pathname = usePathname();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAssistentes();
      setAssistentes(res.dados ?? []);
    } catch (err: any) {
      setError(
        err?.response?.data?.erro ||
          err?.message ||
          "Erro ao carregar assistentes.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch, pathname]);

  return (
    <>
      <div className="p-4 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Assistentes Académicos</h1>
              <p className="text-xs text-muted-foreground">
                {assistentes.length} assistente{assistentes.length !== 1 ? "s" : ""} registado{assistentes.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetch}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              title="Actualizar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {isAdmin && (
              <Button
                onClick={() => setShowCreate(true)}
                className="h-9 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white px-4 gap-1.5"
              >
                <Plus className="w-4 h-4" /> Criar Assistente
              </Button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : error ? (
          /* Erro */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Erro ao carregar</p>
            <p className="text-xs text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetch} variant="outline" size="sm" className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Tentar novamente
            </Button>
          </div>
        ) : assistentes.length === 0 ? (
          /* Empty */
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Brain className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm font-medium">Nenhum assistente académico</p>
            {isAdmin && (
              <>
                <p className="text-xs mt-1 mb-4">Crie o seu primeiro assistente para começar.</p>
                <Button onClick={() => setShowCreate(true)} variant="outline" className="h-8 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Criar Assistente
                </Button>
              </>
            )}
          </div>
        ) : (
          /* Grid de Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assistentes.map((a) => {
              const status = statusBadge(a.ativo, a.conexao_status);
              const StatusIcon = status.icon;
              const ModoIcon = modoAcessoIcon(a.modo_acesso);

              return (
                <Link key={a.uuid_publico} href={`/assistentes/${a.uuid_publico}`}>
                  <Card className="shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group h-full">
                    <CardContent className="p-5 flex flex-col h-full">
                      {/* Top row: icon + arrow */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Brain className="w-5 h-5 text-purple-500" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                      </div>

                      {/* Nome */}
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {a.nome}
                      </h3>

                      {/* Modelo IA + Status */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal gap-1">
                          <Cpu className="w-3 h-3" />
                          {a.modelo_ia}
                        </Badge>
                        <Badge className={`text-[10px] h-5 px-1.5 font-normal gap-1 border ${status.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </Badge>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50 mt-auto">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Thermometer className="w-3.5 h-3.5" />
                          <span>Temp: {a.temperatura}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Hash className="w-3.5 h-3.5" />
                          <span>{a.max_tokens_resposta} tokens</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{a.horario_24h ? "24h" : `${a.horario_inicio}–${a.horario_fim}`}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <ModoIcon className="w-3.5 h-3.5" />
                          <span>{modoAcessoLabel(a.modo_acesso)}</span>
                        </div>
                      </div>

                      {/* WhatsApp status */}
                      {a.conexao_numero && (
                        <div className="mt-2 pt-2 border-t border-border/30 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <MessageSquare className="w-3 h-3" />
                          <span>{a.conexao_numero}</span>
                          <span className="ml-auto opacity-60">{a.waba_tier}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <CriarAssistenteBaseWizard onClose={() => setShowCreate(false)} onCreated={fetch} />
      )}
    </>
  );
}

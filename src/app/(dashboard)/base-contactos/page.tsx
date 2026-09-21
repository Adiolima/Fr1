"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookUser, Plus, ArrowRight, Users, GraduationCap, UserCheck, Briefcase,
  Loader2, X, AlertTriangle, RefreshCw, ChevronLeft, Clock, Sun, CloudSun, Moon, School,
} from "lucide-react";
import {
  createBaseCompleta,
  type CriarBaseCompletaResposta,
} from "@/services/baseContactosService";
import { getBases, type BaseContacto } from "@/services/baseContactosService";
import {
  getCatalogoTurnos,
  getCatalogoCursos,
  type CatalogoTurno,
  type CatalogoCurso,
} from "@/services/pessoasService";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";

/* ─── Turnos padrão ─── */
const TURNOS_PADRAO = [
  { key: "manha", label: "Manhã", icon: Sun },
  { key: "tarde", label: "Tarde", icon: CloudSun },
  { key: "noite", label: "Noite", icon: Moon },
];

/* ─── Classes pré-definidas ─── */
const CLASSES_BASE = [
  "Iniciação", "1ª Classe", "2ª Classe", "3ª Classe",
  "4ª Classe", "5ª Classe", "6ª Classe", "7ª Classe", "8ª Classe", "9ª Classe",
];

type TurnoState = { ativo: boolean };

function CriarBasePanel({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  // Step 1
  const [step, setStep] = useState<1 | 2>(1);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [temEnsinoBase, setTemEnsinoBase] = useState(true);
  const [temEnsinoMedio, setTemEnsinoMedio] = useState(false);
  const [incluirPre, setIncluirPre] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 2: Turnos (catálogo alimenta os nomes; valor enviado é sempre o código)
  const [turnos, setTurnos] = useState<Record<string, TurnoState>>({
    manha: { ativo: true },
    tarde: { ativo: true },
    noite: { ativo: false },
  });
  const [turnosCatalogo, setTurnosCatalogo] = useState<CatalogoTurno[]>([]);

  // Step 2: Cursos (Ensino Médio) — seleccionados a partir do catálogo
  const [catalogoCursos, setCatalogoCursos] = useState<CatalogoCurso[]>([]);
  const [cursosSelecionados, setCursosSelecionados] = useState<Set<string>>(new Set());
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  useEffect(() => {
    let vivo = true;
    setLoadingCatalogos(true);
    Promise.all([
      getCatalogoTurnos().catch(() => [] as CatalogoTurno[]),
      getCatalogoCursos().catch(() => [] as CatalogoCurso[]),
    ])
      .then(([turnosCat, cursosCat]) => {
        if (!vivo) return;
        setTurnosCatalogo(turnosCat);
        setCatalogoCursos(cursosCat);
      })
      .finally(() => vivo && setLoadingCatalogos(false));
    return () => { vivo = false; };
  }, []);

  const toggleTurno = (key: string) => {
    setTurnos((prev) => ({ ...prev, [key]: { ativo: !prev[key].ativo } }));
  };

  const toggleCurso = (codigo: string) => {
    setCursosSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(codigo)) next.delete(codigo);
      else next.add(codigo);
      return next;
    });
  };

  const nomeTurno = (key: string, fallback: string) =>
    turnosCatalogo.find((c) => c.codigo === key)?.nome ?? fallback;

  const turnosAtivosCount = Object.keys(turnos).filter((k) => turnos[k].ativo).length;

  const erroValidacao =
    turnosAtivosCount === 0
      ? "Seleciona pelo menos 1 turno."
      : temEnsinoMedio && cursosSelecionados.size === 0
        ? "Com ensino médio activo, selecciona pelo menos 1 curso."
        : "";

  const handleSubmit = async () => {
    setError("");
    if (turnosAtivosCount === 0) {
      setError("Seleciona pelo menos 1 turno.");
      return;
    }
    if (temEnsinoMedio && cursosSelecionados.size === 0) {
      setError("Com ensino médio activo, selecciona pelo menos 1 curso.");
      return;
    }
    setLoading(true);
    try {
      // UMA ÚNICA chamada — backend cria turnos/classes/cursos
      const res: CriarBaseCompletaResposta = await createBaseCompleta({
        nome: nome.trim(),
        descricao: descricao.trim() || undefined,
        tem_ensino_base: temEnsinoBase,
        tem_ensino_medio: temEnsinoMedio,
        incluir_pre: temEnsinoBase ? incluirPre : undefined,
        turnos_ativos: Object.keys(turnos).filter((k) => turnos[k].ativo),
        cursos_selecionados: temEnsinoMedio ? [...cursosSelecionados] : [],
      });
      await onCreated();
      onClose();
      toast.success("Base criada", {
        description: `"${nome.trim()}" — ${res.turnos_ativos} turno(s), ${res.classes_criadas} classe(s), ${res.cursos_associados} curso(s).`,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.mensagem ||
        err?.response?.data?.erro ||
        (typeof err?.response?.data === "string" ? err.response.data : "") ||
        "Erro ao criar base.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const stepIndicator = (
    <div className="flex items-center justify-center gap-2 mb-5">
      {([1, 2] as const).map((s, i) => (
        <React.Fragment key={s}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
            step === s ? "bg-primary text-white shadow shadow-primary/40" : "bg-muted text-muted-foreground"
          }`}>{i + 1}</div>
          {i < 1 && <div className="w-6 h-px bg-border" />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Nova Base de Contactos</h2>
            <p className="text-[10px] text-muted-foreground">Passo {step} de 2</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {stepIndicator}

        {error && <div className="text-xs px-3 py-2 rounded-lg mb-4 bg-red-500/10 border border-red-500/20 text-red-500">{error}</div>}

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); if (nome.trim()) setStep(2); }} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Nome <span className="text-red-400">*</span></label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                placeholder="Base Principal" required
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Descrição</label>
              <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)}
                placeholder="Breve descrição da base de contactos" rows={3}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground block">Níveis de Ensino</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={temEnsinoBase} onCheckedChange={(v) => { setTemEnsinoBase(v); if (!v) setIncluirPre(false); }} />
                  <span className="text-sm text-foreground">Ensino Base</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={temEnsinoMedio} onCheckedChange={setTemEnsinoMedio} />
                  <span className="text-sm text-foreground">Ensino Médio</span>
                </label>
              </div>
              {temEnsinoBase && (
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-border bg-muted/10">
                  <Switch checked={incluirPre} onCheckedChange={setIncluirPre} />
                  <span className="text-sm text-foreground">Incluir classe de Iniciação (Pré)?</span>
                </label>
              )}
            </div>
            <Button type="submit" disabled={!nome.trim()}
              className="w-full h-10 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white font-semibold">
              Continuar <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <button type="button" onClick={() => setStep(1)}
              className="flex items-center text-xs text-muted-foreground hover:text-foreground transition-all">
              <ChevronLeft className="w-3 h-3 mr-1" /> Voltar
            </button>

            {/* Turnos */}
            <div className="border border-border rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" /> Turnos
              </h3>
              {loadingCatalogos ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> A carregar…
                </div>
              ) : (
                TURNOS_PADRAO.map((t) => {
                  const st = turnos[t.key];
                  return (
                    <div key={t.key} className="flex items-center gap-3">
                      <Switch checked={st.ativo} onCheckedChange={() => toggleTurno(t.key)} />
                      <t.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{nomeTurno(t.key, t.label)}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Ensino Base */}
            {temEnsinoBase && (
              <div className="border border-border rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-500" /> Ensino Base
                </h3>
                <p className="text-[10px] text-muted-foreground mb-2">
                  As classes 1ª–9ª são ativadas automaticamente. A Iniciação (Pré) é opcional:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {CLASSES_BASE.map((c) => {
                    const isPre = c === "Iniciação";
                    return (
                      <label key={c} className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-border transition-all ${isPre ? "bg-muted/10 cursor-pointer hover:bg-muted/30" : "bg-muted/5"}`}>
                        <Switch
                          checked={isPre ? incluirPre : true}
                          disabled={!isPre}
                          onCheckedChange={(v) => isPre && setIncluirPre(v)}
                          title={isPre ? undefined : "Criada automaticamente"}
                        />
                        <span className="text-sm text-foreground">{c}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ensino Médio */}
            {temEnsinoMedio && (
              <div className="border border-border rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <School className="w-4 h-4 text-amber-500" /> Ensino Médio
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  Classes 10ª–13ª são criadas automaticamente. Seleciona os cursos:
                </p>
                {loadingCatalogos ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" /> A carregar cursos…
                  </div>
                ) : catalogoCursos.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Catálogo de cursos indisponível — tenta novamente.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto">
                    {catalogoCursos.map((c) => (
                      <label key={c.codigo} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/10 cursor-pointer hover:bg-muted/30 transition-all">
                        <Checkbox checked={cursosSelecionados.has(c.codigo)} onCheckedChange={() => toggleCurso(c.codigo)} />
                        <span className="text-sm text-foreground flex-1">{c.nome}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{c.sigla ?? c.codigo}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {erroValidacao && (
              <div className="text-xs px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600">{erroValidacao}</div>
            )}

            <Button onClick={handleSubmit} disabled={loading}
              className="w-full h-10 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white font-semibold">
              {loading ? (<><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> A criar…</>) : "Criar Base"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BaseContactosPage() {
  const [bases, setBases] = useState<BaseContacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.papel === "admin";
  const pathname = usePathname();

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBases();
      setBases(data);
    } catch (err: any) {
      setError(err?.response?.data?.erro || err?.response?.data?.mensagem || err?.message || "Erro ao carregar bases de contactos");
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20 flex items-center justify-center">
              <BookUser className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Base de Contactos</h1>
              <p className="text-xs text-muted-foreground">{bases.length} base{bases.length !== 1 ? "s" : ""} registada{bases.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={() => setShowCreate(true)}
              className="h-9 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white px-4 gap-1.5">
              <Plus className="w-4 h-4" /> Criar Base
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : error ? (
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
        ) : bases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <BookUser className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-sm font-medium">Nenhuma base de contactos</p>
            {isAdmin && (
              <>
                <p className="text-xs mt-1 mb-4">Crie a sua primeira base para começar.</p>
                <Button onClick={() => setShowCreate(true)} variant="outline" className="h-8 text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1.5" /> Criar Base
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {bases.map((base) => (
              <Link key={base.uuid_publico} href={`/base-contactos/${base.uuid_publico}`}>
                <Card className="shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookUser className="w-5 h-5 text-cyan-500" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{base.nome}</h3>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2 flex-1">{base.descricao || "Sem descrição"}</p>
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="w-3.5 h-3.5" /> {base.total_contactos ?? 0} contactos
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <GraduationCap className="w-3.5 h-3.5" /> {base.total_alunos ?? 0} alunos
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <UserCheck className="w-3.5 h-3.5" /> {base.total_professores ?? 0} profs
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Briefcase className="w-3.5 h-3.5" /> {base.total_funcionarios ?? 0} funcs
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showCreate && <CriarBasePanel onClose={() => setShowCreate(false)} onCreated={fetch} />}
    </>
  );
}

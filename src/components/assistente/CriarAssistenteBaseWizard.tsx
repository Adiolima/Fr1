"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Brain,
  ArrowRight,
  ArrowLeft,
  X,
  Loader2,
  Shield,
  Globe,
  Clock,
  Sun,
  CloudSun,
  Moon,
  School,
  GraduationCap,
  BookUser,
  Check,
  Sparkles,
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-react";
import {
  criarAssistenteEBase,
  type AssistenteBaseCreateResponse,
} from "@/services/assistenteService";
import {
  getCatalogoTurnos,
  getCatalogoCursos,
  type CatalogoTurno,
  type CatalogoCurso,
} from "@/services/pessoasService";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

type WizardStep = "assistente" | "base" | "turnos-cursos" | "sucesso";

const TURNOS_PADRAO = [
  { key: "manha", label: "Manhã", icon: Sun },
  { key: "tarde", label: "Tarde", icon: CloudSun },
  { key: "noite", label: "Noite", icon: Moon },
];

const MODOS_ACESSO = [
  { value: "restrito", label: "Restrito", desc: "Apenas contactos da base" },
  { value: "aberto", label: "Aberto", desc: "Qualquer número" },
];

export function CriarAssistenteBaseWizard({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("assistente");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ─── Tab 1: Assistente ───
  const [nome, setNome] = useState("");
  const [nomeAssistente, setNomeAssistente] = useState("");
  const [apresentacao, setApresentacao] = useState("");
  const [horario24h, setHorario24h] = useState(true);
  const [horarioInicio, setHorarioInicio] = useState("07:00");
  const [horarioFim, setHorarioFim] = useState("18:00");
  const [modoAcesso, setModoAcesso] = useState<"restrito" | "aberto">("restrito");

  // ─── Tab 2: Base ───
  const [baseNome, setBaseNome] = useState("");
  const [baseDesc, setBaseDesc] = useState("");
  const [temEnsinoBase, setTemEnsinoBase] = useState(true);
  const [temEnsinoMedio, setTemEnsinoMedio] = useState(false);
  const [incluirPre, setIncluirPre] = useState(false);

  // ─── Tab 3: Turnos + Cursos ───
  const [turnosCatalogo, setTurnosCatalogo] = useState<CatalogoTurno[]>([]);
  const [turnosAtivos, setTurnosAtivos] = useState<string[]>(["manha", "tarde"]);
  const [catalogoCursos, setCatalogoCursos] = useState<CatalogoCurso[]>([]);
  const [cursosSelecionados, setCursosSelecionados] = useState<string[]>([]);
  const [cursoParaAdicionar, setCursoParaAdicionar] = useState<string>("");
  const [loadingCatalogos, setLoadingCatalogos] = useState(false);

  // ─── Tab 4: Sucesso ───
  const [resposta, setResposta] = useState<AssistenteBaseCreateResponse | null>(null);

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
    return () => {
      vivo = false;
    };
  }, []);

  const turnosAtivosCount = turnosAtivos.length;
  const erroValidacaoFinal = useMemo(() => {
    if (turnosAtivosCount === 0) return "Selecciona pelo menos 1 turno.";
    if (temEnsinoMedio && cursosSelecionados.length === 0)
      return "Com ensino médio activo, selecciona pelo menos 1 curso.";
    return "";
  }, [turnosAtivosCount, temEnsinoMedio, cursosSelecionados.length]);

  const toggleTurno = (codigo: string) => {
    setTurnosAtivos((prev) =>
      prev.includes(codigo)
        ? prev.filter((c) => c !== codigo)
        : [...prev, codigo],
    );
  };

  const toggleCurso = (codigo: string) => {
    setCursosSelecionados((prev) =>
      prev.includes(codigo)
        ? prev.filter((c) => c !== codigo)
        : [...prev, codigo],
    );
  };

  const adicionarCurso = () => {
    if (!cursoParaAdicionar) return;
    if (!cursosSelecionados.includes(cursoParaAdicionar)) {
      setCursosSelecionados((prev) => [...prev, cursoParaAdicionar]);
    }
    setCursoParaAdicionar("");
  };

  const removerCurso = (codigo: string) => {
    setCursosSelecionados((prev) => prev.filter((c) => c !== codigo));
  };

  const cursosDisponiveis = catalogoCursos.filter(
    (c) => !cursosSelecionados.includes(c.codigo),
  );

  const cursosAdicionados = cursosSelecionados
    .map((cod) => catalogoCursos.find((c) => c.codigo === cod))
    .filter((c): c is CatalogoCurso => Boolean(c));

  const nomeTurno = (key: string, fallback: string) =>
    turnosCatalogo.find((c) => c.codigo === key)?.nome ?? fallback;

  const validarAssistente = () => {
    if (!nome.trim() || !nomeAssistente.trim() || !apresentacao.trim())
      return "Preenche nome, nome do assistente e apresentação.";
    if (!horario24h && (!horarioInicio || !horarioFim))
      return "Define o horário de funcionamento.";
    if (!horario24h && horarioFim <= horarioInicio)
      return "A hora de fim deve ser depois da hora de início.";
    return "";
  };

  const validarBase = () => {
    if (!baseNome.trim()) return "Preenche o nome da base de contactos.";
    if (!temEnsinoBase && !temEnsinoMedio)
      return "Selecciona pelo menos um nível de ensino.";
    return "";
  };

  const handleAvancarParaBase = () => {
    const e = validarAssistente();
    if (e) {
      setError(e);
      return;
    }
    setError("");
    setStep("base");
  };

  const handleAvancarParaTurnosCursos = () => {
    const e = validarBase();
    if (e) {
      setError(e);
      return;
    }
    setError("");
    setStep("turnos-cursos");
  };

  const handleSubmit = async () => {
    if (erroValidacaoFinal) {
      setError(erroValidacaoFinal);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await criarAssistenteEBase({
        nome: nome.trim(),
        nome_assistente: nomeAssistente.trim(),
        apresentacao: apresentacao.trim(),
        horario_24h: horario24h,
        horario_inicio: horario24h ? undefined : `${horarioInicio}:00`,
        horario_fim: horario24h ? undefined : `${horarioFim}:00`,
        modo_acesso: modoAcesso,
        base_nome: baseNome.trim(),
        base_descricao: baseDesc.trim() || undefined,
        tem_ensino_base: temEnsinoBase,
        tem_ensino_medio: temEnsinoMedio,
        incluir_pre: temEnsinoBase ? incluirPre : undefined,
        turnos_ativos: turnosAtivos,
        cursos_selecionados: temEnsinoMedio ? cursosSelecionados : [],
      });
      setResposta(res);
      setStep("sucesso");
      onCreated();
      toast.success("Assistente e base criados", {
        description: "Já pode ligar o WhatsApp quando quiser.",
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.erro ||
        err?.response?.data?.mensagem ||
        err?.message ||
        "Erro ao criar assistente e base.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";
  const labelCls = "text-xs font-semibold text-foreground mb-1.5 block";

  const stepIndex = ["assistente", "base", "turnos-cursos", "sucesso"].indexOf(step);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-[640px] max-h-[92vh] overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Novo Assistente + Base
              </h2>
              <p className="text-[10px] text-muted-foreground">
                {step === "sucesso"
                  ? "Concluído"
                  : `Passo ${Math.min(stepIndex + 1, 3)} de 3`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicator */}
        {step !== "sucesso" && (
          <div className="flex items-center justify-center gap-2 px-5 pt-4 pb-2 shrink-0">
            {(["assistente", "base", "turnos-cursos"] as WizardStep[]).map(
              (s, i) => (
                <React.Fragment key={s}>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      i < stepIndex
                        ? "bg-emerald-500 text-white"
                        : i === stepIndex
                        ? "bg-primary text-white shadow shadow-primary/40"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < stepIndex ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < 2 && (
                    <div
                      className={`w-8 h-px ${i < stepIndex ? "bg-emerald-500" : "bg-border"}`}
                    />
                  )}
                </React.Fragment>
              ),
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error && step !== "sucesso" && (
            <div className="text-xs px-3 py-2 rounded-lg mb-4 bg-red-500/10 border border-red-500/20 text-red-500">
              {error}
            </div>
          )}

          {/* ─── Tab 1: Assistente ─── */}
          {step === "assistente" && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>
                  Nome <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: CTSG"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>
                  Nome do assistente <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={nomeAssistente}
                  onChange={(e) => setNomeAssistente(e.target.value)}
                  placeholder="Ex: Tomás"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>
                  Apresentação <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={apresentacao}
                  onChange={(e) => setApresentacao(e.target.value)}
                  placeholder="Ex: Trabalhas na secretaria do CTSG em Luanda."
                  rows={3}
                  className={`${inputCls} resize-none py-2`}
                />
              </div>

              {/* Horário */}
              <div className="rounded-xl border border-border p-4">
                <label className="flex items-center justify-between gap-3 cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Funciona 24 horas
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Desactive para escolher o horário.
                    </p>
                  </div>
                  <Switch
                    checked={horario24h}
                    onCheckedChange={setHorario24h}
                  />
                </label>
                {!horario24h && (
                  <div className="grid grid-cols-2 gap-3 pt-4 mt-3 border-t border-border/60">
                    <div>
                      <label className={labelCls}>Início</label>
                      <input
                        type="time"
                        value={horarioInicio}
                        onChange={(e) => setHorarioInicio(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Fim</label>
                      <input
                        type="time"
                        value={horarioFim}
                        onChange={(e) => setHorarioFim(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modo de acesso */}
              <div>
                <label className={labelCls}>Modo de Acesso</label>
                <div className="flex gap-3">
                  {MODOS_ACESSO.map((m) => {
                    const Icon = m.value === "restrito" ? Shield : Globe;
                    const active = modoAcesso === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() =>
                          setModoAcesso(m.value as "restrito" | "aberto")
                        }
                        className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          active
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <div className="text-center">
                          <p className="text-sm font-semibold">{m.label}</p>
                          <p className="text-[10px] opacity-70">{m.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── Tab 2: Base ─── */}
          {step === "base" && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>
                  Nome da Base <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={baseNome}
                  onChange={(e) => setBaseNome(e.target.value)}
                  placeholder="Base Principal"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Descrição</label>
                <textarea
                  value={baseDesc}
                  onChange={(e) => setBaseDesc(e.target.value)}
                  placeholder="Breve descrição da base de contactos"
                  rows={3}
                  className={`${inputCls} resize-none py-2`}
                />
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Níveis de Ensino</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={temEnsinoBase}
                      onCheckedChange={(v) => {
                        setTemEnsinoBase(v);
                        if (!v) setIncluirPre(false);
                      }}
                    />
                    <span className="text-sm text-foreground">Ensino Base</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Switch
                      checked={temEnsinoMedio}
                      onCheckedChange={setTemEnsinoMedio}
                    />
                    <span className="text-sm text-foreground">Ensino Médio</span>
                  </label>
                </div>
                {temEnsinoBase && (
                  <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-border bg-muted/10">
                    <Switch
                      checked={incluirPre}
                      onCheckedChange={setIncluirPre}
                    />
                    <span className="text-sm text-foreground">
                      Incluir classe de Iniciação (Pré)?
                    </span>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* ─── Tab 3: Turnos + Cursos ─── */}
          {step === "turnos-cursos" && (
            <div className="space-y-6">
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
                  <div className="grid grid-cols-3 gap-3">
                    {TURNOS_PADRAO.map((t) => {
                      const Icon = t.icon;
                      const ativo = turnosAtivos.includes(t.key);
                      return (
                        <label
                          key={t.key}
                          className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                            ativo
                              ? "border-primary bg-primary/5"
                              : "border-border bg-muted/20 hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                            <span className="text-sm text-foreground truncate">
                              {nomeTurno(t.key, t.label)}
                            </span>
                          </div>
                          <Switch
                            checked={ativo}
                            onCheckedChange={() => toggleTurno(t.key)}
                          />
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Ensino Base preview */}
              {temEnsinoBase && (
                <div className="border border-border rounded-xl p-4 space-y-1.5">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-500" /> Ensino Base
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    As classes 1ª–9ª são criadas automaticamente.
                    {incluirPre ? " Iniciação (Pré) incluída." : ""}
                  </p>
                </div>
              )}

              {/* Cursos — select + botão adicionar + lista */}
              {temEnsinoMedio && (
                <div className="border border-border rounded-xl p-4 space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <School className="w-4 h-4 text-amber-500" /> Cursos (Ensino Médio)
                  </h3>

                  {loadingCatalogos ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" /> A carregar cursos…
                    </div>
                  ) : catalogoCursos.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      Catálogo de cursos indisponível.
                    </p>
                  ) : (
                    <>
                      {/* Selector + botão adicionar */}
                      <div className="flex gap-2">
                        <select
                          value={cursoParaAdicionar}
                          onChange={(e) => setCursoParaAdicionar(e.target.value)}
                          disabled={cursosDisponiveis.length === 0}
                          className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {cursosDisponiveis.length === 0
                              ? "Todos os cursos já foram adicionados"
                              : "Selecciona um curso para adicionar…"}
                          </option>
                          {cursosDisponiveis.map((c) => (
                            <option key={c.codigo} value={c.codigo}>
                              {c.nome} — {c.sigla ?? c.codigo}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          onClick={adicionarCurso}
                          disabled={!cursoParaAdicionar}
                          className="h-10 px-4 bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white font-semibold gap-1.5 cursor-pointer shrink-0"
                        >
                          <Plus className="w-4 h-4" /> Adicionar
                        </Button>
                      </div>

                      {/* Lista de cursos adicionados */}
                      <div className="rounded-lg border border-border overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-b border-border">
                          <p className="text-xs font-semibold text-foreground">
                            Cursos seleccionados
                          </p>
                          <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted/50 font-medium">
                            {cursosAdicionados.length} {cursosAdicionados.length === 1 ? "curso" : "cursos"}
                          </span>
                        </div>
                        {cursosAdicionados.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-6 text-center">
                            <School className="w-8 h-8 text-muted-foreground/40 mb-1.5" />
                            <p className="text-xs text-muted-foreground">Nenhum curso adicionado</p>
                            <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                              Selecciona um curso acima e clica em Adicionar.
                            </p>
                          </div>
                        ) : (
                          <ul className="divide-y divide-border/60">
                            {cursosAdicionados.map((c, idx) => (
                              <li key={c.codigo} className="flex items-center gap-3 px-3 py-2 hover:bg-muted/20 transition-all">
                                <span className="shrink-0 w-6 h-6 rounded-md bg-amber-500/15 flex items-center justify-center text-[10px] font-bold text-amber-500">
                                  {idx + 1}
                                </span>
                                <span className="flex-1 text-sm font-medium text-foreground truncate">
                                  {c.nome}
                                </span>
                                <span className="shrink-0 text-[10px] font-mono text-muted-foreground px-1.5 py-0.5 rounded bg-muted/40">
                                  {c.sigla ?? c.codigo}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removerCurso(c.codigo)}
                                  className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                                  title="Remover curso"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {erroValidacaoFinal && (
                <div className="text-xs px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600">
                  {erroValidacaoFinal}
                </div>
              )}
            </div>
          )}

          {/* ─── Tab 4: Sucesso ─── */}
          {step === "sucesso" && resposta && (
            <div className="space-y-5 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Assistente e base criados!
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  “{nomeAssistente}” está pronto a ser ligado ao WhatsApp.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <NumberCard
                  icon={<Clock className="w-4 h-4 text-emerald-500" />}
                  value={resposta.turnos_ativos}
                  label="Turnos"
                />
                <NumberCard
                  icon={<BookUser className="w-4 h-4 text-cyan-500" />}
                  value={resposta.classes_criadas}
                  label="Classes"
                />
                <NumberCard
                  icon={<School className="w-4 h-4 text-amber-500" />}
                  value={resposta.cursos_associados}
                  label="Cursos"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() =>
                    router.push(`/assistentes/${resposta.assistente_uuid}/conectar-whatsapp`)
                  }
                  className="flex-1 h-10 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white font-semibold gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" /> Conectar WhatsApp
                </Button>
                <Button
                  onClick={() => {
                    onClose();
                    router.push(`/assistentes/${resposta.assistente_uuid}`);
                  }}
                  variant="outline"
                  className="flex-1 h-10 text-sm gap-1.5"
                >
                  Conectar depois
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions (only when not sucesso) */}
        {step !== "sucesso" && (
          <div className="flex gap-2 px-5 py-4 border-t border-border shrink-0">
            {step !== "assistente" && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setStep(
                    step === "base"
                      ? "assistente"
                      : step === "turnos-cursos"
                        ? "base"
                        : "assistente",
                  )
                }
                className="h-10 text-sm gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Button>
            )}
            {step === "assistente" && (
              <Button
                type="button"
                onClick={handleAvancarParaBase}
                className="flex-1 h-10 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white font-semibold gap-1.5"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {step === "base" && (
              <Button
                type="button"
                onClick={handleAvancarParaTurnosCursos}
                className="flex-1 h-10 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white font-semibold gap-1.5"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {step === "turnos-cursos" && (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 h-10 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white font-semibold gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> A criar…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Criar Assistente + Base
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NumberCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3 text-center">
      <div className="flex items-center justify-center mb-1.5">{icon}</div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export default CriarAssistenteBaseWizard;

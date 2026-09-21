"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Plus, X, Search, Edit2, Trash2, Phone, Loader2, Save, Clock,
  RefreshCw, AlertTriangle, AlertCircle, Users, UserRound, GraduationCap, UserCheck,
  Briefcase, School, Layers, Upload, Download, FileSpreadsheet,
} from "lucide-react";
import {
  getBase, updateBase, updateEstruturaBase, deleteBase,
  getTurnosBase, getClassesBase, getCursosBase,
  type BaseContacto, type BaseTurno, type BaseClasse, type BaseCurso,
} from "@/services/baseContactosService";
import {
  getCatalogoCursos,
  getTurmas, createTurma, updateTurma, deleteTurma,
  createEncarregado,
  createFuncionario,
  createAluno, createAlunoComEncarregado, vincularEncarregadoAluno,
  createProfessor,
  getContactosPorPapel,
  importarContactos, LIMITE_IMPORTACAO,
  type Turma, type ContactoResumo, type TipoImportacao,
  type ImportarContactosResposta,
} from "@/services/pessoasService";
import * as XLSX from "xlsx";

type Tab = "contactos" | "estrutura" | "definicoes";
type PapelFilter = "todos" | "aluno" | "encarregado" | "funcionario" | "professor";

function getErro(err: any, fallback: string) {
  return (
    err?.response?.data?.mensagem ||
    err?.response?.data?.erro ||
    (typeof err?.response?.data === "string" ? err.response.data : "") ||
    err?.message ||
    fallback
  );
}

/* ─── Modal genérico ─── */
function Modal({ title, subtitle, onClose, wide, children }: {
  title: string; subtitle?: string; onClose: () => void; wide?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-card border border-border rounded-2xl shadow-2xl w-full p-6 z-10 max-h-[calc(100vh-20px)] overflow-y-auto ${wide ? "max-w-2xl" : "max-w-md"}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputCls =
  "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";
const selectCls =
  "w-full h-9 px-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all";
const labelCls = "text-xs font-semibold text-foreground mb-1.5 block";

/* ═══════════ MODAL: Nova turma ═══════════ */
function NovaTurmaModal({ baseUid, classes, turnos, cursos, temMedio, onClose, onCreated }: {
  baseUid: string; classes: BaseClasse[]; turnos: BaseTurno[]; cursos: BaseCurso[];
  temMedio: boolean; onClose: () => void; onCreated: () => void;
}) {
  const [nome, setNome] = useState("");
  const [classeUuid, setClasseUuid] = useState("");
  const [turnoUuid, setTurnoUuid] = useState("");
  const [cursoUuid, setCursoUuid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const classeSel = classes.find((c) => c.uuid_publico === classeUuid);
  const precisaCurso = classeSel?.tipo_ensino === "medio";
  const turmasTurnosAtivos = turnos.filter((t) => t.ativo !== false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!nome.trim() || !classeUuid || !turnoUuid) {
      setError("Preenche nome, classe e turno.");
      return;
    }
    if (precisaCurso && !cursoUuid) {
      setError("Turmas do ensino médio requerem um curso.");
      return;
    }
    setLoading(true);
    try {
      await createTurma(baseUid, {
        nome: nome.trim(),
        classe_uuid: classeUuid,
        turno_uuid: turnoUuid,
        curso_uuid: precisaCurso ? cursoUuid : null,
      });
      toast.success("Turma criada");
      onCreated();
      onClose();
    } catch (err: any) {
      setError(getErro(err, "Erro ao criar turma."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Nova Turma" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="text-xs px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">{error}</div>}
        <div>
          <label className={labelCls}>Nome <span className="text-red-400">*</span></label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="A" required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Classe <span className="text-red-400">*</span></label>
          <select value={classeUuid} onChange={(e) => { setClasseUuid(e.target.value); setCursoUuid(""); }} required className={selectCls}>
            <option value="">Seleccionar…</option>
            {classes.map((c) => (
              <option key={c.uuid_publico} value={c.uuid_publico}>
                {c.nome}{c.tipo_ensino === "medio" ? " (médio)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Turno <span className="text-red-400">*</span></label>
          <select value={turnoUuid} onChange={(e) => setTurnoUuid(e.target.value)} required className={selectCls}>
            <option value="">Seleccionar…</option>
            {turmasTurnosAtivos.map((t) => <option key={t.uuid_publico} value={t.uuid_publico}>{t.nome}</option>)}
          </select>
        </div>
        {/* curso escondido quando a classe for de ensino base */}
        {precisaCurso && (
          <div>
            <label className={labelCls}>Curso <span className="text-red-400">*</span></label>
            <select value={cursoUuid} onChange={(e) => setCursoUuid(e.target.value)} required className={selectCls}>
              <option value="">Seleccionar…</option>
              {cursos.map((c) => <option key={c.uuid_publico} value={c.uuid_publico}>{c.nome}{c.sigla ? ` (${c.sigla})` : ""}</option>)}
            </select>
          </div>
        )}
        {temMedio && !precisaCurso && classeUuid && (
          <p className="text-[11px] text-muted-foreground">Classes do ensino base não levam curso.</p>
        )}
        <Button type="submit" disabled={loading} className="w-full h-10 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white font-semibold">
          {loading ? "A criar…" : "Criar Turma"}
        </Button>
      </form>
    </Modal>
  );
}

/* ═══════════ MODAL: Adicionar pessoa ═══════════ */
type TipoPessoa = "aluno" | "encarregado" | "funcionario" | "professor" | "segundo";

function NovaPessoaModal({ baseUid, temEnsinoBase, temEnsinoMedio, cursos, classes, turmas, onClose, onCreated }: {
  baseUid: string;
  temEnsinoBase: boolean;
  temEnsinoMedio: boolean;
  cursos: BaseCurso[];
  classes: BaseClasse[];
  turmas: Turma[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [step, setStep] = useState<"tipo" | "ensino" | "form">("tipo");
  const [tipo, setTipo] = useState<TipoPessoa | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // dados comuns
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  // aluno — estrutura escolar
  const [ensinoNivel, setEnsinoNivel] = useState<"base" | "medio" | null>(null);
  const [cursoId, setCursoId] = useState("");
  const [classeId, setClasseId] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [numProcesso, setNumProcesso] = useState("");

  // aluno — encarregado no mesmo formulário
  const [encNome, setEncNome] = useState("");
  const [encTel, setEncTel] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [respFin, setRespFin] = useState(true);
  const [respPrinc, setRespPrinc] = useState(true);

  // funcionário
  const [cargo, setCargo] = useState("");
  const [departamento, setDepartamento] = useState("");

  // 2º encarregado (aluno existente)
  const [alunoUuid2, setAlunoUuid2] = useState("");
  const [contactoUuid2, setContactoUuid2] = useState("");

  const temEnsino = temEnsinoBase || temEnsinoMedio;

  const tipos = [
    { value: "professor", label: "Professor", icon: UserCheck },
    ...(temEnsino ? [{ value: "aluno", label: "Aluno", icon: GraduationCap }] : []),
    ...(temEnsino ? [{ value: "encarregado", label: "Encarregado", icon: Users }] : []),
    { value: "funcionario", label: "Funcionário", icon: Briefcase },
  ];

  const ambosNiveis = temEnsinoBase && temEnsinoMedio;

  const classesFiltradas = ensinoNivel
    ? classes.filter((c) => c.tipo_ensino === ensinoNivel && c.ativo !== false)
    : classes;

  const turmasFiltradas = turmas.filter((t) => {
    if (t.ativo === false) return false;
    if (ensinoNivel && t.tipo_ensino !== ensinoNivel) return false;
    if (classeId) {
      const classe = classes.find((c) => c.uuid_publico === classeId);
      if (classe && t.classe_nome !== classe.nome) return false;
    }
    if (cursoId) {
      const curso = cursos.find((c) => c.uuid_publico === cursoId);
      if (curso && t.curso_sigla !== curso.sigla && t.curso_nome !== curso.nome) return false;
    }
    return true;
  });

  const escolherTipo = (v: string) => {
    setTipo(v as TipoPessoa);
    setError("");
    if (v === "aluno" && ambosNiveis) {
      setStep("ensino");
    } else {
      if (v === "aluno") {
        const nivel = temEnsinoBase ? "base" : "medio";
        setEnsinoNivel(nivel);
        if (nivel === "base") setCursoId("");
      } else {
        setEnsinoNivel(null);
      }
      setStep("form");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tipo === "aluno") {
        if (!nome.trim() || !turmaId) {
          setError("Preenche o nome do aluno e seleciona a turma. O telefone é opcional.");
          setLoading(false);
          return;
        }
        // encarregado preenchido → rota recomendada (aluno + encarregado no mesmo formulário)
        if (encNome.trim() || encTel.trim()) {
          if (!encNome.trim() || !encTel.trim()) {
            setError("Para associar um encarregado, preenche o nome e o telefone dele.");
            setLoading(false);
            return;
          }
          const res = await createAlunoComEncarregado(baseUid, {
            nome_aluno: nome.trim(),
            telefone_aluno: telefone.trim() || undefined, // nunca obrigatório
            turma_uuid: turmaId,
            numero_processo: numProcesso.trim() || undefined,
            nome_encarregado: encNome.trim(),
            telefone_encarregado: encTel.trim(),
            parentesco: parentesco.trim() || undefined,
            responsavel_financeiro: respFin,
            responsavel_principal: respPrinc,
          });
          if (res.encarregado_reutilizado) {
            toast.info("Encarregado reutilizado", { description: "Esta pessoa já era encarregada — associámos também a este filho." });
          }
          toast.success("Aluno matriculado");
        } else {
          await createAluno(baseUid, {
            nome: nome.trim(),
            telefone: telefone.trim() || undefined,
            turma_uuid: turmaId,
            numero_processo: numProcesso.trim() || undefined,
          });
          toast.success("Aluno adicionado");
        }
        onCreated();
        onClose();
      } else if (tipo === "encarregado") {
        if (!nome.trim() || !telefone.trim()) {
          setError("Preenche nome e telefone.");
          setLoading(false);
          return;
        }
        await createEncarregado(baseUid, { nome: nome.trim(), telefone: telefone.trim() });
        toast.success("Encarregado adicionado");
        onCreated();
        onClose();
      } else if (tipo === "funcionario") {
        if (!nome.trim() || !telefone.trim()) {
          setError("Preenche nome e telefone.");
          setLoading(false);
          return;
        }
        await createFuncionario(baseUid, {
          nome: nome.trim(),
          telefone: telefone.trim(),
          cargo: cargo.trim() || undefined,
          departamento: departamento.trim() || undefined,
        });
        toast.success("Funcionário adicionado");
        onCreated();
        onClose();
      } else if (tipo === "professor") {
        if (!nome.trim() || !telefone.trim()) {
          setError("Preenche nome e telefone.");
          setLoading(false);
          return;
        }
        const res = await createProfessor(baseUid, { nome: nome.trim(), telefone: telefone.trim() });
        toast.success("Professor adicionado", { description: `Código: ${res.professor_codigo}` });
        onCreated();
        onClose();
      }
    } catch (err: any) {
      setError(getErro(err, "Erro ao criar contacto."));
    } finally {
      setLoading(false);
    }
  };

  const vincularSegundo = async () => {
    setError("");
    if (!alunoUuid2.trim() || !contactoUuid2.trim()) {
      setError("Indica o uuid do aluno e o contacto_uuid do encarregado (cria primeiro em “Encarregado” se ainda não existir).");
      return;
    }
    setLoading(true);
    try {
      await vincularEncarregadoAluno(baseUid, alunoUuid2.trim(), {
        contacto_uuid: contactoUuid2.trim(),
        parentesco: parentesco.trim() || undefined,
        responsavel_financeiro: false,
        responsavel_principal: false,
      });
      toast.success("Encarregado associado ao aluno");
      onCreated();
      onClose();
    } catch (err: any) {
      setError(getErro(err, "Erro ao vincular."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="w-[520px] h-full bg-card border-l border-border flex flex-col shadow-2xl relative"
        style={{ animation: "slideInRight 260ms cubic-bezier(0.4,0,0.2,1)" }}
      >
        {/* Spinner overlay */}
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-[3px] border-muted" />
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
              </div>
              <p className="text-sm font-medium text-foreground">A criar contacto...</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Adicionar Contacto</h2>
              <p className="text-[10px] text-muted-foreground">
                {tipo ? (tipo === "segundo" ? "2º Encarregado" : tipo.charAt(0).toUpperCase() + tipo.slice(1)) : "Selecione o tipo"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {error && !loading && (
            <div className="text-xs px-3 py-2 rounded-lg mb-4 bg-red-500/10 border border-red-500/20 text-red-500">{error}</div>
          )}

          {/* Passo: escolher tipo */}
          {step === "tipo" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground mb-4">Selecione o tipo de contacto:</p>
              {tipos.map((t) => (
                <button key={t.value} type="button" onClick={() => escolherTipo(t.value)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left group cursor-pointer">
                  <div className="w-9 h-9 rounded-lg bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-all">
                    <t.icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{t.label}</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
              <button type="button" onClick={() => escolherTipo("segundo")}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left group cursor-pointer">
                <div className="w-9 h-9 rounded-lg bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-all">
                  <Users className="w-4.5 h-4.5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">2º Encarregado (aluno existente)</span>
                <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            </div>
          )}

          {/* Passo: escolher nível de ensino (aluno, ambos níveis) */}
          {step === "ensino" && (
            <div className="space-y-4">
              <button type="button" onClick={() => { setStep("tipo"); setTipo(""); }}
                className="flex items-center text-xs text-muted-foreground hover:text-foreground mb-1 transition-all cursor-pointer">
                <ArrowLeft className="w-3 h-3 mr-1" /> Voltar
              </button>
              <p className="text-sm font-medium text-foreground">Selecione o nível de ensino:</p>
              <div className="space-y-3 mt-2">
                {temEnsinoBase && (
                  <button type="button" onClick={() => { setEnsinoNivel("base"); setCursoId(""); setStep("form"); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left group cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                      <School className="w-4.5 h-4.5 text-blue-500" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Ensino Base</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                )}
                {temEnsinoMedio && (
                  <button type="button" onClick={() => { setEnsinoNivel("medio"); setStep("form"); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left group cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                      <GraduationCap className="w-4.5 h-4.5 text-amber-500" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Ensino Médio</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Passo: formulário por tipo */}
          {step === "form" && (
            <form onSubmit={submit} className="space-y-4">
              <button type="button" onClick={() => { setStep(tipo === "aluno" && ambosNiveis ? "ensino" : "tipo"); }}
                className="flex items-center text-xs text-muted-foreground hover:text-foreground mb-1 transition-all cursor-pointer">
                <ArrowLeft className="w-3 h-3 mr-1" /> Voltar
              </button>

              <div>
                <label className={labelCls}>Nome <span className="text-red-400">*</span></label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required
                  className={inputCls} />
              </div>

              {tipo !== "aluno" && (
                <div>
                  <label className={labelCls}>Telefone <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} required
                      className={`${inputCls} pl-9`} />
                  </div>
                </div>
              )}

              {/* Aluno: telefone opcional + estrutura escolar */}
              {tipo === "aluno" && (
                <>
                  <div>
                    <label className={labelCls}>Telefone <span className="text-muted-foreground font-normal">(opcional)</span></label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)}
                        className={`${inputCls} pl-9`} />
                    </div>
                  </div>

                  <div className="bg-muted/20 rounded-xl p-4 border border-border space-y-3">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-amber-500" /> Estrutura Escolar
                      {ensinoNivel && (
                        <Badge variant="outline" className="text-[9px] ml-1 capitalize">
                          {ensinoNivel === "base" ? "Ensino Base" : "Ensino Médio"}
                        </Badge>
                      )}
                    </p>

                    {ensinoNivel === "medio" && (
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">Curso</label>
                        <select value={cursoId} onChange={(e) => { setCursoId(e.target.value); setClasseId(""); setTurmaId(""); }} className={selectCls}>
                          <option value="">Todos</option>
                          {cursos.map((c) => <option key={c.uuid_publico} value={c.uuid_publico}>{c.nome} ({c.sigla ?? c.codigo})</option>)}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Classe</label>
                      <select value={classeId} onChange={(e) => { setClasseId(e.target.value); setTurmaId(""); }} className={selectCls}>
                        <option value="">Todas</option>
                        {classesFiltradas.map((c) => <option key={c.uuid_publico} value={c.uuid_publico}>{c.nome}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Turma <span className="text-red-400">*</span></label>
                      <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} required className={selectCls}>
                        <option value="">Seleccionar…</option>
                        {turmasFiltradas.map((t) => (
                          <option key={t.uuid_publico} value={t.uuid_publico}>
                            {t.classe_nome ?? ""} {t.nome}{t.curso_sigla ? ` (${t.curso_sigla})` : ""} · {t.turno_nome ?? ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Nº processo <span className="text-muted-foreground font-normal">(opcional)</span></label>
                      <input value={numProcesso} onChange={(e) => setNumProcesso(e.target.value)} className={inputCls} placeholder="2026/001" />
                    </div>
                  </div>

                  {/* Encarregado (igual ao antigo: opcional, com nome + telefone) */}
                  <div className="bg-muted/20 rounded-xl p-4 border border-border space-y-3">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-500" /> Encarregado <span className="text-muted-foreground font-normal">(opcional)</span>
                    </p>
                    <input type="text" value={encNome} onChange={(e) => setEncNome(e.target.value)}
                      placeholder="Nome do encarregado"
                      className={inputCls} />
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input type="text" value={encTel} onChange={(e) => setEncTel(e.target.value)}
                        placeholder="Telefone do encarregado"
                        className={`${inputCls} pl-9`} />
                    </div>
                    <input type="text" value={parentesco} onChange={(e) => setParentesco(e.target.value)}
                      placeholder="Parentesco (ex: Mãe)" className={inputCls} />
                    <div className="flex gap-5">
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox checked={respFin} onCheckedChange={(v) => setRespFin(v === true)} /> Responsável financeiro
                      </label>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                        <Checkbox checked={respPrinc} onCheckedChange={(v) => setRespPrinc(v === true)} /> Responsável principal
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* Funcionário: cargo + departamento */}
              {tipo === "funcionario" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Cargo <span className="text-muted-foreground font-normal">(opcional)</span></label>
                    <input value={cargo} onChange={(e) => setCargo(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Departamento <span className="text-muted-foreground font-normal">(opcional)</span></label>
                    <input value={departamento} onChange={(e) => setDepartamento(e.target.value)} className={inputCls} />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading}
                className="w-full h-10 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white font-semibold transition-all">
                {loading ? "A criar..." : "Criar Contacto"}
              </Button>
            </form>
          )}

          {/* 2º Encarregado */}
          {tipo === "segundo" && step === "tipo" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Se a pessoa ainda não existe, cria primeiro em <strong>Encarregado</strong> e usa o uuid devolvido como contacto_uuid.
              </p>
              <div>
                <label className={labelCls}>UUID do aluno</label>
                <input value={alunoUuid2} onChange={(e) => setAlunoUuid2(e.target.value)} placeholder="uuid_publico do aluno" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>contacto_uuid do encarregado</label>
                <input value={contactoUuid2} onChange={(e) => setContactoUuid2(e.target.value)} placeholder="uuid_publico devolvido ao criar" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Parentesco <span className="text-muted-foreground font-normal">(opcional)</span></label>
                <input value={parentesco} onChange={(e) => setParentesco(e.target.value)} className={inputCls} placeholder="Pai" />
              </div>
              <Button onClick={vincularSegundo} disabled={loading} className="w-full h-10 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white font-semibold">
                {loading ? "A associar..." : "Associar Encarregado"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════ MODAL: Importação Excel ═══════════ */
const MODELO_COLUNAS: Record<TipoImportacao, string[]> = {
  aluno: ["nome", "telefone", "nome_encarregado", "telefone_encarregado"],
  encarregado: ["nome", "telefone"],
  funcionario: ["nome", "telefone", "cargo", "departamento"],
  professor: ["nome", "telefone"],
};

function ImportarModal({ baseUid, turmas, onClose, onDone }: {
  baseUid: string; turmas: Turma[]; onClose: () => void; onDone: () => void;
}) {
  const [tipo, setTipo] = useState<TipoImportacao>("aluno");
  const [turmaUuid, setTurmaUuid] = useState("");
  const [linhas, setLinhas] = useState<Record<string, string>[]>([]);
  const [errosPrev, setErrosPrev] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<ImportarContactosResposta | null>(null);
  const [nomeFicheiro, setNomeFicheiro] = useState("");

  const exportarModelo = () => {
    const cols = MODELO_COLUNAS[tipo];
    const ws = XLSX.utils.json_to_sheet([], { header: cols });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "modelo");
    XLSX.writeFile(wb, `modelo_${tipo}.xlsx`);
  };

  const lerFicheiro = async (f: File) => {
    setError("");
    setResultado(null);
    setNomeFicheiro(f.name);
    try {
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });
      const cols = MODELO_COLUNAS[tipo];
      const normalizadas = json.map((r) => {
        const o: Record<string, string> = {};
        for (const c of cols) o[c] = String(r[c] ?? "").trim();
        return o;
      });
      const prev: string[] = [];
      if (normalizadas.length === 0) prev.push("Ficheiro sem linhas de dados.");
      if (normalizadas.length > LIMITE_IMPORTACAO) prev.push(`Máximo ${LIMITE_IMPORTACAO} linhas por importação — este ficheiro tem ${normalizadas.length}.`);
      normalizadas.forEach((r, i) => {
        if (!r.nome?.trim()) prev.push(`Linha ${i + 2}: nome em falta.`);
      });
      if (tipo === "aluno" && !turmaUuid) prev.push("Escolhe a turma antes de importar alunos.");
      setLinhas(normalizadas);
      setErrosPrev(prev);
    } catch {
      setError("Não foi possível ler o ficheiro .xlsx.");
    }
  };

  const enviar = async () => {
    setError("");
    if (linhas.length === 0) { setError("Nenhuma linha para importar."); return; }
    if (linhas.length > LIMITE_IMPORTACAO) { setError(`Máximo ${LIMITE_IMPORTACAO} linhas por importação.`); return; }
    if (tipo === "aluno" && !turmaUuid) { setError("Escolhe a turma para os alunos."); return; }
    setLoading(true);
    try {
      const res = await importarContactos(baseUid, {
        tipo,
        turma_uuid: tipo === "aluno" ? turmaUuid : undefined,
        contactos: linhas,
      });
      setResultado(res);
      onDone();
    } catch (err: any) {
      setError(getErro(err, "Erro ao importar."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Importar em massa" subtitle={`Máximo ${LIMITE_IMPORTACAO} linhas por importação`} onClose={onClose} wide>
      <div className="flex gap-1.5 flex-wrap mb-3">
        {(["aluno", "encarregado", "funcionario", "professor"] as TipoImportacao[]).map((t) => (
          <button key={t} onClick={() => { setTipo(t); setLinhas([]); setResultado(null); setErrosPrev([]); setNomeFicheiro(""); }}
            className={`px-2.5 py-1.5 text-[11px] font-medium rounded-lg capitalize transition-all cursor-pointer ${tipo === t ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
        <button onClick={exportarModelo} className="ml-auto flex items-center gap-1 px-2.5 py-1.5 text-[11px] rounded-lg border border-border hover:bg-muted transition-all cursor-pointer">
          <Download className="w-3.5 h-3.5" /> Modelo .xlsx
        </button>
      </div>

      {tipo === "aluno" && (
        <div className="mb-3">
          <label className={labelCls}>Turma (obrigatória para alunos)</label>
          <select value={turmaUuid} onChange={(e) => setTurmaUuid(e.target.value)} className={selectCls}>
            <option value="">Seleccionar…</option>
            {turmas.filter((t) => t.ativo !== false).map((t) => (
              <option key={t.uuid_publico} value={t.uuid_publico}>
                {t.classe_nome ?? ""} {t.nome} · {t.turno_nome ?? ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <label className="flex items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-border hover:border-primary/40 cursor-pointer transition-all mb-3">
        <Upload className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{nomeFicheiro || "Escolher ficheiro .xlsx"}</span>
        <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) lerFicheiro(f); }} />
      </label>

      {errosPrev.length > 0 && (
        <div className="text-[11px] px-3 py-2 rounded-lg mb-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 max-h-32 overflow-y-auto">
          {errosPrev.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}
      {error && <div className="text-xs px-3 py-2 rounded-lg mb-3 bg-red-500/10 border border-red-500/20 text-red-500">{error}</div>}

      {linhas.length > 0 && !resultado && (
        <div className="mb-3 max-h-56 overflow-y-auto border border-border rounded-xl">
          <table className="w-full text-[11px] text-left">
            <thead className="text-muted-foreground bg-muted/40 uppercase">
              <tr>{MODELO_COLUNAS[tipo].map((c) => <th key={c} className="px-3 py-2 font-medium">{c}</th>)}</tr>
            </thead>
            <tbody>
              {linhas.slice(0, 10).map((r, i) => (
                <tr key={i} className="border-t border-border/50">
                  {MODELO_COLUNAS[tipo].map((c) => <td key={c} className="px-3 py-1.5">{r[c]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
          {linhas.length > 10 && <p className="text-[10px] text-muted-foreground px-3 py-2">…e mais {linhas.length - 10} linha(s). Pré-visualização das primeiras 10.</p>}
        </div>
      )}

      {resultado && (
        <div className="mb-3 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border p-2.5 text-center"><p className="text-lg font-bold">{resultado.total}</p><p className="text-[10px] text-muted-foreground">total</p></div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5 text-center"><p className="text-lg font-bold text-emerald-600">{resultado.criados}</p><p className="text-[10px] text-muted-foreground">criados</p></div>
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-2.5 text-center"><p className="text-lg font-bold text-blue-600">{resultado.reutilizados}</p><p className="text-[10px] text-muted-foreground">reutilizados</p></div>
          </div>
          {resultado.erros.length > 0 && (
            <div className="text-[11px] px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 max-h-40 overflow-y-auto">
              <p className="font-semibold mb-1">Corrige e reimporta só estas linhas:</p>
              {resultado.erros.map((e, i) => <p key={i}>Linha {e.linha}: {e.nome} ({e.telefone}) — {e.motivo}</p>)}
            </div>
          )}
        </div>
      )}

      {!resultado && (
        <Button onClick={enviar} disabled={loading || linhas.length === 0} className="w-full h-10 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white font-semibold">
          {loading ? "A importar…" : `Importar ${linhas.length} linha(s)`}
        </Button>
      )}
    </Modal>
  );
}

/* ═══════════ PÁGINA ═══════════ */
export function BaseContactosTab({ baseUid }: { baseUid: string }) {
  const router = useRouter();

  const [base, setBase] = useState<BaseContacto | null>(null);
  const [tab, setTab] = useState<Tab>("contactos");
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // contactos
  const [papelFilter, setPapelFilter] = useState<PapelFilter>("todos");
  const [contactos, setContactos] = useState<ContactoResumo[]>([]);
  const [contactosLoading, setContactosLoading] = useState(false);
  const [showNovaPessoa, setShowNovaPessoa] = useState(false);
  const [showImportar, setShowImportar] = useState(false);

  // estrutura
  const [turnos, setTurnos] = useState<BaseTurno[]>([]);
  const [classes, setClasses] = useState<BaseClasse[]>([]);
  const [cursos, setCursos] = useState<BaseCurso[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [showNovaTurma, setShowNovaTurma] = useState(false);
  const [editTurma, setEditTurma] = useState<Turma | null>(null);
  const [delTurma, setDelTurma] = useState<Turma | null>(null);
  const [busy, setBusy] = useState(false);

  // definições
  const [editNome, setEditNome] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editEnsinoBase, setEditEnsinoBase] = useState(true);
  const [editEnsinoMedio, setEditEnsinoMedio] = useState(false);
  const [savingDef, setSavingDef] = useState(false);
  const [showDelBase, setShowDelBase] = useState(false);
  const [delBase, setDelBase] = useState(false);
  // estrutura (evolução) — estado legado (mantido p/ compat, UI removida)
  const [estTurnos, setEstTurnos] = useState<string[]>([]);
  const [estMedio, setEstMedio] = useState(false);
  const [estCursos, setEstCursos] = useState<string[]>([]);
  const [catalogoCursos, setCatalogoCursos] = useState<{ codigo: string; nome: string; sigla?: string }[]>([]);
  const [savingEst, setSavingEst] = useState(false);

  // estrutura — inline forms (ensino base turmas / ensino médio cursos)
  const [showAddTurmaBase, setShowAddTurmaBase] = useState(false);
  const [novaTurmaBaseClasse, setNovaTurmaBaseClasse] = useState("");
  const [novaTurmaBaseLetra, setNovaTurmaBaseLetra] = useState("");
  const [busyAddTurmaBase, setBusyAddTurmaBase] = useState(false);

  const [showAddCursoMedio, setShowAddCursoMedio] = useState(false);
  const [novoCursoSelect, setNovoCursoSelect] = useState("");
  const [busyAddCurso, setBusyAddCurso] = useState(false);
  const [busyRemoveCurso, setBusyRemoveCurso] = useState<string | null>(null);

  const fetchBase = useCallback(async () => {
    if (!baseUid) return;
    setError(null);
    try {
      const b = await getBase(baseUid);
      setBase(b);
      setEditNome(b.nome ?? "");
      setEditDesc(b.descricao ?? "");
      setEditEnsinoBase(b.tem_ensino_base ?? true);
      setEditEnsinoMedio(b.tem_ensino_medio ?? false);
      setEstMedio(b.tem_ensino_medio ?? false);
    } catch (err: any) {
      setError(getErro(err, "Erro ao carregar base"));
    } finally {
      setLoading(false);
    }
  }, [baseUid]);

  const fetchEstrutura = useCallback(async () => {
    if (!baseUid) return;
    try {
      const [t, cl, cu, tu] = await Promise.all([
        getTurnosBase(baseUid).catch(() => [] as BaseTurno[]),
        getClassesBase(baseUid).catch(() => [] as BaseClasse[]),
        getCursosBase(baseUid).catch(() => [] as BaseCurso[]),
        getTurmas(baseUid).catch(() => [] as Turma[]),
      ]);
      setTurnos(t);
      setClasses(cl);
      setCursos(cu);
      setTurmas(tu);
    } catch {
      setTurnos([]); setClasses([]); setCursos([]); setTurmas([]);
    }
  }, [baseUid]);

  const fetchContactos = useCallback(async () => {
    if (!baseUid) return;
    setContactosLoading(true);
    try {
      const lista = await getContactosPorPapel(baseUid, papelFilter === "todos" ? undefined : papelFilter);
      setContactos(lista);
    } catch {
      setContactos([]);
    } finally {
      setContactosLoading(false);
    }
  }, [baseUid, papelFilter]);

  useEffect(() => {
    fetchBase();
    fetchEstrutura();
    getCatalogoCursos().then(setCatalogoCursos).catch(() => {});
  }, [fetchBase, fetchEstrutura]);

  useEffect(() => {
    fetchContactos();
  }, [fetchContactos]);

  const refreshAll = useCallback(() => {
    fetchBase();
    fetchEstrutura();
    fetchContactos();
  }, [fetchBase, fetchEstrutura, fetchContactos]);

  const handleTabChange = useCallback((t: Tab) => {
    setTab(t);
    if (t === "contactos") fetchContactos();
    if (t === "estrutura") { setTabLoading(true); fetchEstrutura().finally(() => setTabLoading(false)); }
  }, [fetchContactos, fetchEstrutura]);

  /* ── definições: dados básicos + toggles de ensino ── */
  const saveDefinicoes = async (overrides?: { tem_ensino_base?: boolean; tem_ensino_medio?: boolean }) => {
    setSavingDef(true);
    try {
      await updateBase(baseUid, {
        nome: editNome,
        descricao: editDesc,
        tem_ensino_base: overrides?.tem_ensino_base ?? editEnsinoBase,
        tem_ensino_medio: overrides?.tem_ensino_medio ?? editEnsinoMedio,
      });
      await fetchBase();
      toast.success("Definições guardadas");
    } catch (err: any) {
      toast.error("Erro ao guardar", { description: getErro(err, "Não foi possível actualizar.") });
    } finally {
      setSavingDef(false);
    }
  };

  const toggleEnsinoBase = async (newVal: boolean) => {
    setEditEnsinoBase(newVal);
    await saveDefinicoes({ tem_ensino_base: newVal });
  };

  const toggleEnsinoMedio = async (newVal: boolean) => {
    setEditEnsinoMedio(newVal);
    await saveDefinicoes({ tem_ensino_medio: newVal });
  };

  /* ── estrutura: evolução ── */
  const toggleEstTurno = (codigo: string) => {
    setEstTurnos((prev) => prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo]);
  };
  const toggleEstCurso = (codigo: string) => {
    setEstCursos((prev) => prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo]);
  };

  // inicializa selecção de estrutura a partir dos dados carregados
  useEffect(() => {
    setEstTurnos(turnos.filter((t) => t.ativo !== false).map((t) => t.codigo ?? t.nome.toLowerCase()));
  }, [turnos]);
  useEffect(() => {
    setEstCursos(cursos.map((c) => c.codigo ?? c.sigla ?? ""));
  }, [cursos]);

  const saveEstrutura = async () => {
    setSavingEst(true);
    try {
      await updateEstruturaBase(baseUid, {
        tem_ensino_medio: estMedio,
        turnos_ativos: estTurnos,
        cursos_selecionados: estMedio ? estCursos : [],
      });
      await refreshAll();
      toast.success("Estrutura actualizada");
    } catch (err: any) {
      // 409 com contagens — mostrar claramente e orientar para turmas
      toast.error("Não foi possível actualizar", { description: getErro(err, "Resolve as turmas indicadas e tenta de novo.") });
    } finally {
      setSavingEst(false);
    }
  };

  const apagarBase = async () => {
    setDelBase(true);
    try {
      await deleteBase(baseUid);
      toast.success("Base desactivada");
      router.replace(`/assistentes?_t=${Date.now()}`);
    } catch (err: any) {
      toast.error("Erro", { description: getErro(err, "Não foi possível desactivar.") });
      setDelBase(false);
      setShowDelBase(false);
    }
  };

  /* ── turmas ── */
  const mudarTurnoTurma = async (t: Turma, novoTurno: string) => {
    try {
      await updateTurma(baseUid, t.uuid_publico, { turno_uuid: novoTurno });
      fetchEstrutura();
    } catch (err: any) {
      toast.error("Erro", { description: getErro(err, "Não foi possível mudar o turno.") });
    }
  };

  const confirmarApagarTurma = async () => {
    if (!delTurma) return;
    setBusy(true);
    try {
      await deleteTurma(baseUid, delTurma.uuid_publico);
      toast.success("Turma desactivada");
      setDelTurma(null);
      fetchEstrutura();
    } catch (err: any) {
      toast.error("Não foi possível apagar", { description: getErro(err, "Transfere os alunos primeiro.") });
    } finally {
      setBusy(false);
    }
  };

  /* ── estrutura: adicionar turma (ensino base, inline) ── */
  const adicionarTurmaBase = async () => {
    if (!novaTurmaBaseClasse || !novaTurmaBaseLetra) {
      toast.error("Escolhe a classe e a letra da turma.");
      return;
    }
    const turno = turnos.find((t) => t.ativo !== false);
    if (!turno) {
      toast.error("Sem turnos activos", { description: "Activa pelo menos um turno antes de criar turmas." });
      return;
    }
    setBusyAddTurmaBase(true);
    try {
      await createTurma(baseUid, {
        nome: novaTurmaBaseLetra,
        classe_uuid: novaTurmaBaseClasse,
        turno_uuid: turno.uuid_publico,
        curso_uuid: null,
      });
      toast.success("Turma criada");
      setNovaTurmaBaseClasse("");
      setNovaTurmaBaseLetra("");
      setShowAddTurmaBase(false);
      await fetchEstrutura();
    } catch (err: any) {
      toast.error("Erro ao criar turma", { description: getErro(err, "Tenta novamente.") });
    } finally {
      setBusyAddTurmaBase(false);
    }
  };

  /* ── estrutura: adicionar/remover curso (ensino médio) ── */
  const adicionarCursoMedio = async () => {
    if (!novoCursoSelect) {
      toast.error("Escolhe um curso do catálogo.");
      return;
    }
    setBusyAddCurso(true);
    try {
      const codigosAtuais = cursos
        .map((c) => c.codigo ?? c.sigla ?? "")
        .filter(Boolean);
      const novos = Array.from(new Set([...codigosAtuais, novoCursoSelect]));
      await updateEstruturaBase(baseUid, { cursos_selecionados: novos });
      toast.success("Curso adicionado");
      setNovoCursoSelect("");
      setShowAddCursoMedio(false);
      await refreshAll();
    } catch (err: any) {
      toast.error("Erro ao adicionar curso", { description: getErro(err, "Tenta novamente.") });
    } finally {
      setBusyAddCurso(false);
    }
  };

  const removerCursoMedio = async (curso: BaseCurso) => {
    const codigo = curso.codigo ?? curso.sigla ?? "";
    if (!codigo) return;
    const turmasAssociadas = turmasMedio.filter((t) => t.curso_uuid === curso.uuid_publico);
    if (turmasAssociadas.length > 0) {
      toast.error("Não pode remover: existem turmas associadas", {
        description: `${turmasAssociadas.length} turma(s) activa(s) neste curso. Transfere ou desactiva primeiro.`,
      });
      return;
    }
    setBusyRemoveCurso(curso.uuid_publico);
    try {
      const codigosAtuais = cursos
        .map((c) => c.codigo ?? c.sigla ?? "")
        .filter(Boolean);
      const novos = codigosAtuais.filter((c) => c !== codigo);
      await updateEstruturaBase(baseUid, { cursos_selecionados: novos });
      toast.success("Curso removido");
      await refreshAll();
    } catch (err: any) {
      toast.error("Erro ao remover curso", { description: getErro(err, "Tenta novamente.") });
    } finally {
      setBusyRemoveCurso(null);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-6">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
      <p className="text-sm font-medium text-gray-900 mb-1">A carregar base de contactos</p>
      <p className="text-xs text-gray-500 mb-8">{baseUid}</p>
    </div>
  );

  if (error) return (
    <div className="p-4">
      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
        <AlertTriangle className="w-6 h-6 text-red-500" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">Erro ao carregar</p>
      <p className="text-xs text-muted-foreground mb-4">{error}</p>
      <button onClick={fetchBase} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer">
        <RefreshCw className="w-3.5 h-3.5 inline mr-1.5" /> Tentar novamente
      </button>
    </div>
  );

  if (!base) return (
    <div className="p-4">
      <p className="text-sm text-muted-foreground">Base não encontrada ({baseUid}).</p>
    </div>
  );

  const papelIcon = (p: string) => {
    switch (p) {
      case "aluno": return <GraduationCap className="w-3.5 h-3.5 text-blue-500" />;
      case "professor": return <UserCheck className="w-3.5 h-3.5 text-purple-500" />;
      case "encarregado": return <Users className="w-3.5 h-3.5 text-amber-500" />;
      case "funcionario": return <Briefcase className="w-3.5 h-3.5 text-emerald-500" />;
      default: return null;
    }
  };

  const safe = {
    nome: base?.nome ?? "",
    descricao: base?.descricao ?? "",
    total_contactos: base?.total_contactos ?? contactos.length,
    total_alunos: base?.total_alunos ?? 0,
    total_professores: base?.total_professores ?? 0,
    total_funcionarios: base?.total_funcionarios ?? 0,
    total_encarregados: base?.total_encarregados ?? 0,
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "contactos", label: "Contactos" },
    { key: "estrutura", label: "Estrutura Escolar" },
    { key: "definicoes", label: "Definições" },
  ];

  const turmasBase = turmas.filter((t) => (t.tipo_ensino ?? "") === "base");
  const turmasMedio = turmas.filter((t) => (t.tipo_ensino ?? "") === "medio");

  // ── derivados da estrutura escolar (tabs estrutura + definicoes) ──
  const TODAS_LETRAS = ["A", "B", "C", "D", "E", "F", "G"];
  const classesBase = classes.filter((c) => (c.tipo_ensino ?? "base") === "base" && c.ativo !== false);
  const classesMedio = classes.filter((c) => c.tipo_ensino === "medio" && c.ativo !== false);
  const codigosCursosAtuais = cursos.map((c) => c.codigo ?? c.sigla ?? "").filter(Boolean);
  const cursosDisponiveis = catalogoCursos.filter((c) => !codigosCursosAtuais.includes(c.codigo));
  const classeSelNovaTurma = classes.find((c) => c.uuid_publico === novaTurmaBaseClasse);
  const letrasUsadasBase = novaTurmaBaseClasse
    ? turmasBase
        .filter((t) => t.classe_uuid === novaTurmaBaseClasse || (classeSelNovaTurma && t.classe_nome === classeSelNovaTurma.nome))
        .map((t) => (t.nome ?? "").trim().toUpperCase())
    : [];
  const letrasDisponiveisBase = TODAS_LETRAS.filter((l) => !letrasUsadasBase.includes(l));

  const temEnsinoBase = base?.tem_ensino_base ?? true;
  const temEnsinoMedio = base?.tem_ensino_medio ?? false;
  const ensinoBaseBloqueado = turmasBase.length > 0;
  const ensinoMedioBloqueado = turmasMedio.length > 0;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 max-w-[1400px] mx-auto w-full shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-foreground">{safe.nome}</h1>
          <button onClick={refreshAll} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer" title="Actualizar">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">{safe.descricao}</p>

        <div className="grid grid-cols-7 gap-3 mb-4">
          {[
            { icon: Users, label: "Total Contactos", value: safe.total_contactos, color: "text-cyan-500", bg: "bg-cyan-500/10" },
            { icon: GraduationCap, label: "Alunos", value: safe.total_alunos, color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: UserCheck, label: "Professores", value: safe.total_professores, color: "text-purple-500", bg: "bg-purple-500/10" },
            { icon: Briefcase, label: "Funcionários", value: safe.total_funcionarios, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { icon: UserRound, label: "Encarregados", value: safe.total_encarregados, color: "text-amber-500", bg: "bg-amber-500/10" },
            { icon: School, label: "Cursos", value: cursos.length, color: "text-amber-500", bg: "bg-amber-500/10" },
            { icon: Layers, label: "Turmas", value: turmas.length, color: "text-pink-500", bg: "bg-pink-500/10" },
          ].map((m, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.bg}`}>
                  <m.icon className={`w-[18px] h-[18px] ${m.color}`} />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                  <p className="text-lg font-bold leading-tight">{m.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-1 border-b border-border">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => handleTabChange(t.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-all cursor-pointer ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 max-w-[1400px] mx-auto w-full pb-4">
        {tabLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-[3px] border-muted" />
                <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
              </div>
              <p className="text-sm font-medium text-foreground">A carregar…</p>
            </div>
          </div>
        )}

        {/* ─── CONTACTOS ─── */}
        {!tabLoading && tab === "contactos" && (
          <div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex gap-2">
                <Button onClick={() => setShowNovaPessoa(true)} className="h-8 text-xs bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white px-3 gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </Button>
                <Button onClick={() => setShowImportar(true)} variant="outline" className="h-8 text-xs gap-1.5">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Importar Excel
                </Button>
              </div>
              <select value={papelFilter} onChange={(e) => setPapelFilter(e.target.value as PapelFilter)}
                className="h-8 px-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40">
                <option value="todos">Todos os papéis</option>
                <option value="aluno">Alunos</option>
                <option value="encarregado">Encarregados</option>
                <option value="funcionario">Funcionários</option>
                <option value="professor">Professores</option>
              </select>
            </div>

            <Card className="shadow-sm border-border overflow-hidden">
              <CardContent className="p-0">
                {contactosLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : contactos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Users className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm">Nenhum contacto encontrado</p>
                    <p className="text-[11px] mt-1">A listagem mostra papel, estado e autorização — nomes e telefones vivem nos detalhes de cada papel.</p>
                  </div>
                ) : (
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] text-muted-foreground bg-muted/40 uppercase border-b border-border">
                      <tr>
                        <th className="px-4 py-3 font-medium">Papel</th>
                        <th className="px-3 py-3 font-medium">Estado</th>
                        <th className="px-3 py-3 font-medium">Autorizado</th>
                        <th className="px-3 py-3 font-medium">UUID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contactos.map((c) => (
                        <tr key={c.uuid_publico} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5 capitalize text-muted-foreground">
                              {papelIcon(c.papel)} {c.papel}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-muted-foreground capitalize">{c.estado}</td>
                          <td className="px-3 py-3">
                            <span className="flex items-center gap-1.5">
                              <span className="relative flex h-2 w-2">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${c.autorizado ? "bg-emerald-400" : "bg-red-400"}`} />
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${c.autorizado ? "bg-emerald-500" : "bg-red-500"}`} />
                              </span>
                              <span className="text-[10px]">{c.autorizado ? "Sim" : "Não"}</span>
                            </span>
                          </td>
                          <td className="px-3 py-3 text-muted-foreground font-mono text-[10px]">{c.uuid_publico.slice(0, 8)}…</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── ESTRUTURA ─── */}
        {!tabLoading && tab === "estrutura" && (
          <div className="space-y-6">
            {!temEnsinoBase && !temEnsinoMedio ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <School className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm font-medium">Nenhum nível de ensino habilitado</p>
                <p className="text-xs mt-1">Activa o ensino base e/ou médio no separador “Definições”.</p>
              </div>
            ) : (
              <>
                {/* Top: Turnos da instituição */}
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold flex items-center gap-1.5 mb-3">
                      <Clock className="w-4 h-4 text-emerald-500" /> Turnos da instituição
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {turnos.map((t) => (
                        <div key={t.uuid_publico} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/20">
                          <p className="text-sm font-medium">{t.nome}</p>
                          <Badge variant="outline" className="text-[10px]">{t.ativo === false ? "inactivo" : "activo"}</Badge>
                        </div>
                      ))}
                      {turnos.length === 0 && <p className="text-xs text-muted-foreground italic col-span-2 sm:col-span-3">Sem turnos.</p>}
                    </div>
                  </CardContent>
                </Card>

                {/* Section: Ensino de Base */}
                {temEnsinoBase && (
                  <Card className="shadow-sm">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="text-sm font-semibold flex items-center gap-1.5">
                          <School className="w-4 h-4 text-blue-500" /> Ensino de Base
                          <Badge variant="outline" className="text-[10px] ml-1">{turmasBase.length} turma(s)</Badge>
                        </h3>
                        <Button
                          onClick={() => {
                            setShowAddTurmaBase((s) => !s);
                            setNovaTurmaBaseClasse("");
                            setNovaTurmaBaseLetra("");
                          }}
                          size="sm" variant="outline" className="h-8 text-xs gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar
                        </Button>
                      </div>

                      {/* Inline form: adicionar turma base */}
                      {showAddTurmaBase && (
                        <div className="flex flex-wrap items-end gap-2 p-3 rounded-lg border border-border bg-muted/20">
                          <div className="flex-1 min-w-[160px]">
                            <label className="text-[10px] text-muted-foreground mb-1 block">Classe</label>
                            <select
                              value={novaTurmaBaseClasse}
                              onChange={(e) => { setNovaTurmaBaseClasse(e.target.value); setNovaTurmaBaseLetra(""); }}
                              className={selectCls}
                            >
                              <option value="">Seleccionar…</option>
                              {classesBase.map((c) => (
                                <option key={c.uuid_publico} value={c.uuid_publico}>{c.nome}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1 min-w-[140px]">
                            <label className="text-[10px] text-muted-foreground mb-1 block">Turma (letra)</label>
                            <select
                              value={novaTurmaBaseLetra}
                              onChange={(e) => setNovaTurmaBaseLetra(e.target.value)}
                              className={selectCls}
                              disabled={!novaTurmaBaseClasse}
                            >
                              <option value="">Seleccionar…</option>
                              {letrasDisponiveisBase.map((l) => (
                                <option key={l} value={l}>{l}</option>
                              ))}
                            </select>
                            {novaTurmaBaseClasse && letrasDisponiveisBase.length === 0 && (
                              <p className="text-[10px] text-amber-600 mt-1">Todas as letras (A–G) já estão usadas nesta classe.</p>
                            )}
                          </div>
                          <Button
                            onClick={adicionarTurmaBase}
                            disabled={busyAddTurmaBase || !novaTurmaBaseClasse || !novaTurmaBaseLetra}
                            size="sm"
                            className="h-9 text-xs gap-1.5 bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white"
                          >
                            {busyAddTurmaBase ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                            Adicionar
                          </Button>
                          <Button
                            onClick={() => { setShowAddTurmaBase(false); setNovaTurmaBaseClasse(""); setNovaTurmaBaseLetra(""); }}
                            size="sm" variant="ghost" className="h-9 text-xs px-2"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}

                      {/* Layout: classes em linha horizontal, turmas listadas verticalmente sob cada classe */}
                      {classesBase.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">Sem classes de ensino base.</p>
                      ) : (
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {classesBase.map((classe) => {
                            const turmasDaClasse = turmasBase.filter(
                              (t) => t.classe_uuid === classe.uuid_publico || t.classe_nome === classe.nome,
                            );
                            return (
                              <div key={classe.uuid_publico} className="min-w-[170px] flex-1">
                                <p className="text-xs font-semibold text-foreground mb-2 px-1">{classe.nome}</p>
                                <div className="space-y-1.5">
                                  {turmasDaClasse.map((t) => {
                                    const totalAlunos = t.total_alunos ?? 0;
                                    const canDelete = totalAlunos === 0;
                                    return (
                                      <div key={t.uuid_publico} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-border bg-muted/20">
                                        <span className="text-xs font-medium flex-1 truncate">{classe.nome} {t.nome}</span>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{totalAlunos} aluno(s)</span>
                                        <button
                                          onClick={() => canDelete && setDelTurma(t)}
                                          disabled={!canDelete}
                                          title={canDelete ? "Desactivar turma" : "Turma com alunos — transfere-os primeiro"}
                                          className={`p-1 rounded-md transition-colors ${canDelete ? "text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer" : "text-muted-foreground opacity-50 cursor-not-allowed"}`}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                  {turmasDaClasse.length === 0 && <p className="text-[10px] text-muted-foreground italic px-1">—</p>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Section: Ensino Médio */}
                {temEnsinoMedio && (
                  <>
                    {/* Sub-section: Cursos */}
                    <Card className="shadow-sm">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h3 className="text-sm font-semibold flex items-center gap-1.5">
                            <GraduationCap className="w-4 h-4 text-amber-500" /> Cursos
                            <Badge variant="outline" className="text-[10px] ml-1">{cursos.length} curso(s) · {turmasMedio.length} turma(s)</Badge>
                          </h3>
                          <Button
                            onClick={() => { setShowAddCursoMedio((s) => !s); setNovoCursoSelect(""); }}
                            size="sm" variant="outline" className="h-8 text-xs gap-1.5"
                            disabled={cursosDisponiveis.length === 0}
                            title={cursosDisponiveis.length === 0 ? "Todos os cursos do catálogo já estão associados" : undefined}
                          >
                            <Plus className="w-3.5 h-3.5" /> Novo Curso
                          </Button>
                        </div>

                        {/* Inline form: adicionar curso */}
                        {showAddCursoMedio && (
                          <div className="flex flex-wrap items-end gap-2 p-3 rounded-lg border border-border bg-muted/20">
                            <div className="flex-1 min-w-[200px]">
                              <label className="text-[10px] text-muted-foreground mb-1 block">Curso do catálogo</label>
                              <select value={novoCursoSelect} onChange={(e) => setNovoCursoSelect(e.target.value)} className={selectCls}>
                                <option value="">Seleccionar…</option>
                                {cursosDisponiveis.map((c) => (
                                  <option key={c.codigo} value={c.codigo}>{c.nome} ({c.sigla ?? c.codigo})</option>
                                ))}
                              </select>
                            </div>
                            <Button
                              onClick={adicionarCursoMedio}
                              disabled={busyAddCurso || !novoCursoSelect}
                              size="sm"
                              className="h-9 text-xs gap-1.5 bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white"
                            >
                              {busyAddCurso ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                              Adicionar
                            </Button>
                            <Button
                              onClick={() => { setShowAddCursoMedio(false); setNovoCursoSelect(""); }}
                              size="sm" variant="ghost" className="h-9 text-xs px-2"
                              title="Cancelar"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}

                        {/* Lista de cursos */}
                        <div className="space-y-1.5">
                          {cursos.map((c) => {
                            const turmasDoCurso = turmasMedio.filter((t) => t.curso_uuid === c.uuid_publico);
                            const hasTurmas = turmasDoCurso.length > 0;
                            const isRemoving = busyRemoveCurso === c.uuid_publico;
                            return (
                              <div key={c.uuid_publico} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/20">
                                <div>
                                  <p className="text-sm font-medium">{c.nome}</p>
                                  <p className="text-[10px] text-muted-foreground">{c.sigla ?? c.codigo}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {hasTurmas && (
                                    <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30 bg-amber-500/5">{turmasDoCurso.length} turma(s)</Badge>
                                  )}
                                  <div className="group relative">
                                    <button
                                      onClick={() => !hasTurmas && !isRemoving && removerCursoMedio(c)}
                                      disabled={hasTurmas || isRemoving}
                                      title={hasTurmas ? "Não pode remover: existem turmas associadas" : isRemoving ? "A remover…" : "Remover curso"}
                                      className={`p-1.5 rounded-md transition-colors ${hasTurmas || isRemoving ? "text-muted-foreground opacity-50 cursor-not-allowed" : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer"}`}
                                    >
                                      {isRemoving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    </button>
                                    {hasTurmas && (
                                      <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 top-full mt-1 z-20 bg-red-500 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
                                        Não pode remover: existem turmas associadas
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {cursos.length === 0 && <p className="text-xs text-muted-foreground italic">Nenhum curso associado.</p>}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sub-section: Turmas por Curso */}
                    <Card className="shadow-sm">
                      <CardContent className="p-4 space-y-4">
                        <h3 className="text-sm font-semibold flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-purple-500" /> Turmas por Curso
                          <Badge variant="outline" className="text-[10px] ml-1">{turmasMedio.length} turma(s)</Badge>
                        </h3>

                        <div className="space-y-3">
                          {cursos.map((curso) => {
                            const turmasDoCurso = turmasMedio.filter((t) => t.curso_uuid === curso.uuid_publico);
                            return (
                              <div key={curso.uuid_publico} className="border border-border rounded-lg p-3 bg-muted/10">
                                <p className="text-sm font-semibold mb-3 text-foreground">
                                  {curso.nome} <span className="text-muted-foreground font-normal">— {curso.sigla ?? curso.codigo}</span>
                                </p>
                                <div className="space-y-2">
                                  {classesMedio.map((classe) => {
                                    const turmasDaClasseCurso = turmasDoCurso.filter(
                                      (t) => t.classe_uuid === classe.uuid_publico || t.classe_nome === classe.nome,
                                    );
                                    return (
                                      <div key={classe.uuid_publico} className="flex items-start gap-3">
                                        <p className="text-xs font-semibold text-muted-foreground min-w-[40px] pt-1.5">{classe.nome}</p>
                                        <div className="flex flex-wrap gap-1.5 flex-1">
                                          {turmasDaClasseCurso.map((t) => {
                                            const totalAlunos = t.total_alunos ?? 0;
                                            const canDelete = totalAlunos === 0;
                                            return (
                                              <div key={t.uuid_publico} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-border bg-muted/20">
                                                <span className="text-xs font-medium">{t.nome}</span>
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{totalAlunos} aluno(s)</span>
                                                <button
                                                  onClick={() => canDelete && setDelTurma(t)}
                                                  disabled={!canDelete}
                                                  title={canDelete ? "Desactivar turma" : "Turma com alunos — transfere-os primeiro"}
                                                  className={`p-0.5 rounded-md transition-colors ${canDelete ? "text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer" : "text-muted-foreground opacity-50 cursor-not-allowed"}`}
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            );
                                          })}
                                          {turmasDaClasseCurso.length === 0 && <p className="text-[10px] text-muted-foreground italic">—</p>}
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {classesMedio.length === 0 && <p className="text-[10px] text-muted-foreground italic">Sem classes de ensino médio.</p>}
                                </div>
                              </div>
                            );
                          })}
                          {cursos.length === 0 && <p className="text-xs text-muted-foreground italic">Adiciona cursos para gerir as respectivas turmas.</p>}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* ─── DEFINIÇÕES ─── */}
        {!tabLoading && tab === "definicoes" && (
          <div className="max-w-xl">
            <Card className="shadow-sm">
              <CardContent className="p-5 space-y-5">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4 text-primary" /> Definições da Base
                </h3>

                {/* Nome */}
                <div>
                  <label className={labelCls}>Nome</label>
                  <input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)} className={inputCls} />
                </div>

                {/* Descrição */}
                <div>
                  <label className={labelCls}>Descrição</label>
                  <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40" />
                </div>

                {/* Toggles de ensino */}
                <div className="space-y-3 pt-1 border-t border-border">
                  <p className="text-xs font-semibold text-foreground pt-3">Níveis de ensino</p>

                  {/* Ensino Base */}
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-2">
                      <School className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Ensino Base</p>
                        <p className="text-[10px] text-muted-foreground">
                          {ensinoBaseBloqueado ? "Existem turmas associadas — desactiva-as primeiro na estrutura." : "Activa/desactiva o ensino base nesta base de contactos."}
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1.5 group"
                      title={ensinoBaseBloqueado ? "Não pode desactivar: existem turmas associadas" : undefined}
                    >
                      {ensinoBaseBloqueado && (
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                      <Switch
                        checked={editEnsinoBase}
                        onCheckedChange={(v) => toggleEnsinoBase(v)}
                        disabled={ensinoBaseBloqueado || savingDef}
                      />
                    </div>
                  </div>

                  {/* Ensino Médio */}
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium">Ensino Médio</p>
                        <p className="text-[10px] text-muted-foreground">
                          {ensinoMedioBloqueado ? "Existem turmas associadas — desactiva-as primeiro na estrutura." : "Activa/desactiva o ensino médio nesta base de contactos."}
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1.5 group"
                      title={ensinoMedioBloqueado ? "Não pode desactivar: existem turmas associadas" : undefined}
                    >
                      {ensinoMedioBloqueado && (
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                      <Switch
                        checked={editEnsinoMedio}
                        onCheckedChange={(v) => toggleEnsinoMedio(v)}
                        disabled={ensinoMedioBloqueado || savingDef}
                      />
                    </div>
                  </div>
                </div>

                {/* Botão Salvar */}
                <Button
                  onClick={() => saveDefinicoes()}
                  disabled={savingDef}
                  className="h-10 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white px-4 gap-1.5 font-semibold w-full sm:w-auto"
                >
                  {savingDef ? (<><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> A guardar…</>) : (<><Save className="w-4 h-4 mr-1.5" /> Salvar Definições</>)}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* modais */}
      {showNovaPessoa && <NovaPessoaModal baseUid={baseUid}
        temEnsinoBase={base?.tem_ensino_base ?? false} temEnsinoMedio={base?.tem_ensino_medio ?? false}
        cursos={cursos} classes={classes} turmas={turmas}
        onClose={() => setShowNovaPessoa(false)} onCreated={refreshAll} />}
      {showImportar && <ImportarModal baseUid={baseUid} turmas={turmas} onClose={() => setShowImportar(false)} onDone={refreshAll} />}
      {showNovaTurma && (
        <NovaTurmaModal baseUid={baseUid} classes={classes} turnos={turnos} cursos={cursos}
          temMedio={base?.tem_ensino_medio ?? false} onClose={() => setShowNovaTurma(false)} onCreated={fetchEstrutura} />
      )}
      {editTurma && (
        <EditarTurmaModal turma={editTurma} turnos={turnos} cursos={cursos}
          onClose={() => setEditTurma(null)}
          onSaved={() => { setEditTurma(null); fetchEstrutura(); }} baseUid={baseUid} />
      )}
      {delTurma && (
        <Modal title="Desactivar turma" onClose={() => !busy && setDelTurma(null)}>
          <p className="text-xs text-muted-foreground mb-4">
            Desactivar a turma “{delTurma.nome}”? Se tiver alunos activos, transfere-os primeiro (a API indica quantos).
          </p>
          <div className="flex gap-2">
            <Button onClick={() => setDelTurma(null)} variant="outline" className="flex-1 h-9 text-xs" disabled={busy}>Cancelar</Button>
            <Button onClick={confirmarApagarTurma} className="flex-1 h-9 text-xs bg-red-500 hover:bg-red-600 text-white border-0" disabled={busy}>
              {busy ? "A processar…" : "Confirmar"}
            </Button>
          </div>
        </Modal>
      )}
      {showDelBase && (
        <Modal title="Desactivar escola" onClose={() => !delBase && setShowDelBase(false)}>
          <p className="text-xs text-muted-foreground mb-1">
            Isto desactiva <strong>“{safe.nome}”</strong> (não apaga dados). Confirma explicitamente para continuar.
          </p>
          <div className="flex gap-2 mt-4">
            <Button onClick={() => setShowDelBase(false)} variant="outline" className="flex-1 h-9 text-xs" disabled={delBase}>Cancelar</Button>
            <Button onClick={apagarBase} className="flex-1 h-9 text-xs bg-red-500 hover:bg-red-600 text-white border-0" disabled={delBase}>
              {delBase ? "A desactivar…" : "Sim, desactivar"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ─── Modal editar turma ─── */
function EditarTurmaModal({ turma, turnos, cursos, baseUid, onClose, onSaved }: {
  turma: Turma; turnos: BaseTurno[]; cursos: BaseCurso[]; baseUid: string;
  onClose: () => void; onSaved: () => void;
}) {
  const [nome, setNome] = useState(turma.nome);
  const [turnoUuid, setTurnoUuid] = useState(turma.turno_uuid ?? "");
  const [cursoUuid, setCursoUuid] = useState(turma.curso_uuid ?? "");
  const [ativo, setAtivo] = useState(turma.ativo !== false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isMedio = (turma.tipo_ensino ?? "") === "medio";

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await updateTurma(baseUid, turma.uuid_publico, {
        nome: nome.trim() || undefined,
        turno_uuid: turnoUuid || undefined,
        curso_uuid: isMedio ? (cursoUuid || null) : undefined,
        ativo,
      });
      toast.success("Turma actualizada");
      onSaved();
    } catch (err: any) {
      setError(getErro(err, "Erro ao actualizar."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={`Editar turma ${turma.nome}`} onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        {error && <div className="text-xs px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">{error}</div>}
        <div>
          <label className={labelCls}>Nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Turno</label>
          <select value={turnoUuid} onChange={(e) => setTurnoUuid(e.target.value)} className={selectCls}>
            <option value="">Manter</option>
            {turnos.filter((t) => t.ativo !== false).map((t) => <option key={t.uuid_publico} value={t.uuid_publico}>{t.nome}</option>)}
          </select>
        </div>
        {isMedio && (
          <div>
            <label className={labelCls}>Curso</label>
            <select value={cursoUuid} onChange={(e) => setCursoUuid(e.target.value)} className={selectCls}>
              <option value="">Manter</option>
              {cursos.map((c) => <option key={c.uuid_publico} value={c.uuid_publico}>{c.nome}</option>)}
            </select>
          </div>
        )}
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <Switch checked={ativo} onCheckedChange={setAtivo} /> Activa
        </label>
        <Button type="submit" disabled={loading} className="w-full h-10 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white font-semibold">
          {loading ? "A guardar…" : "Guardar"}
        </Button>
      </form>
    </Modal>
  );
}

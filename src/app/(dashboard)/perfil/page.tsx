"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User, Mail, Phone, Lock, Eye, EyeOff, Shield, Save, Loader2,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { getMe, updateMe, changePassword } from "@/services/usuarioService";
import { getAssistentes, type Assistente } from "@/services/assistenteService";
import { PERMISSAO_LABELS, labelPapelFuncional } from "@/lib/papeis";
import { mensagemErro } from "@/lib/api-errors";

export default function PerfilPage() {
  const { user: authUser, setUser } = useAuth();
  const isOperador = authUser?.papel === "operador";
  const operador = authUser?.operador;

  const [nome, setNome] = useState(authUser?.nome ?? "");
  const [email] = useState(authUser?.email ?? "");
  const [telefone, setTelefone] = useState(authUser?.telefone ?? "");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const [pwAtual, setPwAtual] = useState("");
  const [pwNova, setPwNova] = useState("");
  const [showPwAtual, setShowPwAtual] = useState(false);
  const [showPwNova, setShowPwNova] = useState(false);
  const [loadingPw, setLoadingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  const [assistentes, setAssistentes] = useState<Assistente[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await getMe();
        setNome(me.nome ?? "");
        setTelefone(me.telefone ?? "");
        if (authUser) {
          setUser({ ...authUser, ...me });
        }
      } catch {}
    })();

    if (isOperador && operador?.assistentes_uuids?.length) {
      setLoadingPerms(true);
      getAssistentes()
        .then((r) => r.dados)
        .catch(() => [] as Assistente[])
        .then((asts) => {
          const uuids = new Set(operador.assistentes_uuids);
          setAssistentes(asts.filter((a) => uuids.has(a.uuid_publico)));
        })
        .finally(() => setLoadingPerms(false));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveProfile = async () => {
    setProfileMsg("");
    setLoadingProfile(true);
    try {
      const updated = await updateMe({ nome, telefone: telefone || null });
      if (authUser) {
        setUser({ ...authUser, ...updated });
      }
      setProfileMsg("Perfil atualizado com sucesso.");
    } catch (err) {
      setProfileMsg(mensagemErro(err));
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPwMsg("");
    if (!pwAtual || !pwNova) {
      setPwMsg("Preencha ambos os campos.");
      return;
    }
    setLoadingPw(true);
    try {
      await changePassword({ password_actual: pwAtual, nova_password: pwNova });
      setPwMsg("Password alterada. Todas as sessões foram revogadas — faça login novamente.");
      setPwAtual("");
      setPwNova("");
    } catch (err) {
      setPwMsg(mensagemErro(err));
    } finally {
      setLoadingPw(false);
    }
  };

  return (
    <div className="p-4 max-w-[900px] mx-auto space-y-6">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Perfil</h1>

      <Card className="shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Dados Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Nome</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-muted/30 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">O email não pode ser alterado.</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">Telefone</label>
            <div className="relative max-w-sm">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>
          </div>

          {profileMsg && (
            <div
              className={`text-xs px-3 py-2 rounded-lg ${
                profileMsg.includes("sucesso")
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600"
                  : "bg-red-500/10 border border-red-500/20 text-red-500"
              }`}
            >
              {profileMsg}
            </div>
          )}

          <Button
            onClick={handleSaveProfile}
            disabled={loadingProfile}
            className="h-9 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white px-4"
          >
            {loadingProfile ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <Save className="w-4 h-4 mr-1.5" />
            )}
            Guardar Alterações
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" /> Alterar Password
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Password Atual</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPwAtual ? "text" : "password"}
                  value={pwAtual}
                  onChange={(e) => setPwAtual(e.target.value)}
                  className="w-full h-10 pl-9 pr-10 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwAtual((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPwAtual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Nova Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPwNova ? "text" : "password"}
                  value={pwNova}
                  onChange={(e) => setPwNova(e.target.value)}
                  className="w-full h-10 pl-9 pr-10 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPwNova((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPwNova ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {pwMsg && (
            <div
              className={`text-xs px-3 py-2 rounded-lg ${
                pwMsg.includes("alterada")
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600"
                  : "bg-red-500/10 border border-red-500/20 text-red-500"
              }`}
            >
              {pwMsg}
            </div>
          )}

          <Button
            onClick={handleChangePassword}
            disabled={loadingPw}
            className="h-9 text-sm bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 border-0 text-white px-4"
          >
            {loadingPw ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
            ) : (
              <Lock className="w-4 h-4 mr-1.5" />
            )}
            Alterar Password
          </Button>
        </CardContent>
      </Card>

      {isOperador && operador && (
        <Card className="shadow-sm">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> As Minhas Permissões
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Papel funcional</p>
              <p className="text-sm font-semibold text-foreground">
                {labelPapelFuncional(operador.papel_funcional)}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2">Permissões</h4>
              {operador.permissoes.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Nenhuma permissão atribuída.</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {operador.permissoes.map((p) => (
                    <Badge key={p} variant="outline" className="text-[9px]">
                      {PERMISSAO_LABELS[p] ?? p}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {operador.papel_funcional !== "financeiro" && (
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-primary" /> Assistentes autorizados
                </h4>
                {loadingPerms ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                  </div>
                ) : assistentes.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Nenhum assistente atribuído.</p>
                ) : (
                  <div className="space-y-1">
                    {assistentes.map((a) => (
                      <div
                        key={a.uuid_publico}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/20"
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-sm text-foreground">{a.nome}</span>
                        <Badge variant="outline" className="text-[9px] ml-auto">
                          {a.modelo_ia}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

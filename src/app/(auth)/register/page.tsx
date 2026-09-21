"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/authService";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Mail,
  Lock,
  Building2,
  Phone,
  Hash,
  User,
  Eye,
  EyeOff,
  ChevronLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import logoSrc from "@/assets/logo.png";

type Step = "empresa" | "admin" | "confirmar" | "verificacao";

export default function RegisterPage() {
  const router = useRouter();
  const { login: setAuth } = useAuth();

  const [step, setStep] = useState<Step>("empresa");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Empresa
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [nif, setNif] = useState("");

  // Admin
  const [nomeAdmin, setNomeAdmin] = useState("");
  const [emailAdmin, setEmailAdmin] = useState("");
  const [passwordAdmin, setPasswordAdmin] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Confirmação
  const [aceitouTermos, setAceitouTermos] = useState(false);

  // Verificação
  const [codigo, setCodigo] = useState("");

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      await authService.register({
        escola: { nome, slug, email, telefone, nif },
        administrador: { nome: nomeAdmin, email: emailAdmin, password: passwordAdmin },
      });
      setStep("verificacao");
    } catch (err: any) {
      setError(err?.response?.data?.erro || err?.response?.data?.mensagem || "Erro ao registar.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await authService.verifyEmail(emailAdmin, codigo);
      setAuth(res.access_token, res.usuario);
      router.replace("/painel");
    } catch (err: any) {
      setError(err?.response?.data?.erro || err?.response?.data?.mensagem || "Código inválido.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.resendVerification(emailAdmin);
    } catch {}
  };

  const steps: Step[] = ["empresa", "admin", "confirmar", "verificacao"];
  const stepIndex = steps.indexOf(step);

  const inputCls =
    "w-full h-11 pl-10 pr-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400/60 transition-all";
  const inputNoIconCls =
    "w-full h-11 px-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400/60 transition-all";
  const labelCls = "text-sm font-medium text-white/70 mb-1.5 block";

  return (
    <AuthShell>
      <div className="w-full max-w-[500px]">
        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-6">
          <img
            src={logoSrc.src}
            alt="Merkron"
            className="w-12 h-12 rounded-xl object-contain mx-auto mb-3"
          />
          <h1 className="text-2xl font-bold text-white">Merkron</h1>
        </div>

        {/* Logo + título (desktop) */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Registar Escola</h1>
          <p className="text-sm text-white/50 mt-1">
            Crie a sua plataforma escolar em minutos
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.slice(0, 3).map((s, i) => (
            <React.Fragment key={s}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < stepIndex
                    ? "bg-emerald-500 text-white"
                    : i === stepIndex
                    ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow shadow-purple-500/40"
                    : "bg-white/10 text-white/50"
                }`}
              >
                {i < stepIndex ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < 2 && (
                <div
                  className={`w-8 h-px ${i < stepIndex ? "bg-emerald-500" : "bg-white/10"}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Empresa */}
          {step === "empresa" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep("admin");
              }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold text-white mb-4">Dados da Escola</h2>
              <div>
                <label className={labelCls}>
                  Nome <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Escola Exemplo"
                    required
                    className={inputCls}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    Slug <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="escola-exemplo"
                    required
                    className={inputNoIconCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>NIF</label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={nif}
                      onChange={(e) => setNif(e.target.value)}
                      placeholder="000000000"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="escola@exemplo.com"
                      required
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Telefone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="+244 900 000 000"
                      className={inputCls}
                    />
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-11 text-sm bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 border-0 text-white rounded-xl gap-2"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          )}

          {/* Step 2: Admin */}
          {step === "admin" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep("confirmar");
              }}
              className="space-y-4"
            >
              <h2 className="text-lg font-bold text-white mb-4">
                Dados do Administrador
              </h2>
              <div>
                <label className={labelCls}>
                  Nome Completo <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={nomeAdmin}
                    onChange={(e) => setNomeAdmin(e.target.value)}
                    placeholder="João Silva"
                    required
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={emailAdmin}
                    onChange={(e) => setEmailAdmin(e.target.value)}
                    placeholder="admin@exemplo.com"
                    required
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>
                  Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordAdmin}
                    onChange={(e) => setPasswordAdmin(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`${inputCls} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("empresa")}
                  className="h-11 text-sm rounded-xl gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 text-sm bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 border-0 text-white rounded-xl gap-2"
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Confirmar */}
          {step === "confirmar" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-4">Confirmar Dados</h2>
              <div className="space-y-3 text-sm">
                <div className="bg-white/[0.04] rounded-xl p-4 border border-white/10">
                  <h3 className="font-semibold text-white/80 mb-2">Escola</h3>
                  <p>
                    <span className="text-white/40">Nome:</span>{" "}
                    <span className="text-white">{nome}</span>
                  </p>
                  <p>
                    <span className="text-white/40">Slug:</span>{" "}
                    <span className="text-white">{slug}</span>
                  </p>
                  <p>
                    <span className="text-white/40">Email:</span>{" "}
                    <span className="text-white">{email}</span>
                  </p>
                  {telefone && (
                    <p>
                      <span className="text-white/40">Telefone:</span>{" "}
                      <span className="text-white">{telefone}</span>
                    </p>
                  )}
                  {nif && (
                    <p>
                      <span className="text-white/40">NIF:</span>{" "}
                      <span className="text-white">{nif}</span>
                    </p>
                  )}
                </div>
                <div className="bg-white/[0.04] rounded-xl p-4 border border-white/10">
                  <h3 className="font-semibold text-white/80 mb-2">Administrador</h3>
                  <p>
                    <span className="text-white/40">Nome:</span>{" "}
                    <span className="text-white">{nomeAdmin}</span>
                  </p>
                  <p>
                    <span className="text-white/40">Email:</span>{" "}
                    <span className="text-white">{emailAdmin}</span>
                  </p>
                </div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer mt-2">
                <Switch
                  checked={aceitouTermos}
                  onCheckedChange={setAceitouTermos}
                />
                <span className="text-xs text-white/50">
                  Aceito os{" "}
                  <span className="text-cyan-400">Termos de Serviço</span> e a{" "}
                  <span className="text-cyan-400">Política de Privacidade</span>
                </span>
              </label>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("admin")}
                  className="h-11 text-sm rounded-xl gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                >
                  <ChevronLeft className="w-4 h-4" /> Voltar
                </Button>
                <Button
                  onClick={handleRegister}
                  disabled={!aceitouTermos || loading}
                  className="flex-1 h-11 text-sm bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 border-0 text-white rounded-xl gap-2"
                >
                  {loading ? "A registar..." : "Finalizar Registo"}{" "}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Verificação */}
          {step === "verificacao" && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Verificar Email</h2>
              <p className="text-sm text-white/50">
                Enviámos um código de verificação para{" "}
                <strong className="text-white">{emailAdmin}</strong>
              </p>
              <div>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) =>
                    setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  maxLength={6}
                  className="w-48 h-14 text-center text-2xl font-mono tracking-[0.5em] rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400/60 transition-all"
                />
              </div>
              <Button
                onClick={handleVerify}
                disabled={codigo.length < 6 || loading}
                className="w-full h-11 text-sm bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 border-0 text-white rounded-xl"
              >
                {loading ? "A verificar..." : "Verificar Email"}
              </Button>
              <button
                onClick={handleResend}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Reenviar Código
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-white/50 mt-8">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
          >
            Iniciar Sessão
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

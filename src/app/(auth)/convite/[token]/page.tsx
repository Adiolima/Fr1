"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, User, Building2, Shield, Loader2, AlertTriangle } from "lucide-react";
import { getConvitePublico, aceitarConvite } from "@/services/equipaService";
import type { ConvitePublico } from "@/lib/papeis";
import { useAuth } from "@/components/auth/auth-provider";
import { mensagemErro } from "@/lib/api-errors";
import logoSrc from "@/assets/logo.png";

export default function AceitarConvitePage() {
  const params = useParams();
  const token = params.token as string;
  const router = useRouter();
  const { login: setAuth } = useAuth();

  const [convite, setConvite] = useState<ConvitePublico | null>(null);
  const [loadingConvite, setLoadingConvite] = useState(true);
  const [error, setError] = useState("");

  const [nome, setNome] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    getConvitePublico(token)
      .then(setConvite)
      .catch((err) => setError(mensagemErro(err)))
      .finally(() => setLoadingConvite(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await aceitarConvite(token, { nome, password });
      setAuth(res.access_token, res.usuario);
      router.replace("/assistentes");
    } catch (err) {
      setError(mensagemErro(err));
    } finally {
      setLoading(false);
    }
  };

  if (loadingConvite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!convite && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] p-4">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Convite inválido</h1>
          <p className="text-white/60 text-sm mb-6">{error}</p>
          <Button onClick={() => router.push("/login")} variant="outline" className="text-white border-white/20">
            Ir para login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full bg-cyan-500/15 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <img src={logoSrc.src} alt="Merkron" className="w-10 h-10 rounded-xl object-contain" />
          <div>
            <p className="text-white font-bold text-lg">Aceitar Convite</p>
            <p className="text-white/50 text-xs">Junte-se à equipa da escola</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 space-y-3">
          <div className="flex items-center gap-3 text-white/80">
            <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wide">Escola</p>
              <p className="text-sm font-medium">{convite?.empresa_nome}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <Shield className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wide">Papel</p>
              <p className="text-sm font-medium">{convite?.papel_label}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white/80">
            <User className="w-4 h-4 text-white/40 shrink-0" />
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wide">Email</p>
              <p className="text-sm font-medium">{convite?.email}</p>
            </div>
          </div>
          {convite?.expira_em && (
            <p className="text-[10px] text-amber-400/80 pt-1">
              Expira em {new Date(convite.expira_em).toLocaleString("pt-AO")}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-white/70 mb-1.5 block">Nome completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Maria Silva Santos"
                required
                className="w-full h-11 pl-9 pr-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-white/70 mb-1.5 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="SenhaForte#123"
                required
                minLength={8}
                className="w-full h-11 pl-9 pr-10 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-white/40 mt-1">
              Mínimo 8 caracteres, com maiúsculas, minúsculas, números e símbolos.
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 border-0 text-white font-semibold"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Aceitar convite e entrar"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

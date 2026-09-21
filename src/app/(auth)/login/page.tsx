"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/authService";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Building2,
  ArrowRight,
} from "lucide-react";
import logoSrc from "@/assets/logo.png";

export default function LoginPage() {
  const router = useRouter();
  const { login: setAuth, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [slug, setSlug] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      router.replace(user.papel === "operador" ? "/assistentes" : "/painel");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authService.login(email, password, slug);
      setAuth(res.access_token, res.usuario);
      router.replace(res.usuario.papel === "operador" ? "/assistentes" : "/painel");
    } catch (err: any) {
      const msg =
        err?.response?.data?.erro ||
        err?.response?.data?.mensagem ||
        err?.response?.data?.message ||
        "Erro ao iniciar sessão. Verifique as credenciais.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full h-11 pl-10 pr-4 rounded-xl border border-white/10 bg-white/5 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400/60 transition-all";

  return (
    <AuthShell>
      <div className="w-full max-w-[420px]">
        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-10">
          <img
            src={logoSrc.src}
            alt="Merkron"
            className="w-12 h-12 rounded-xl object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white">Merkron</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Iniciar Sessão
          </h2>
          <p className="text-sm text-white/50 mt-1.5">
            Aceda à plataforma da sua escola
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Slug */}
          <div>
            <label className="text-sm font-medium text-white/70 mb-2 block">
              Slug da Escola
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="escola-exemplo"
                required
                className={inputCls}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-white/70 mb-2 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@escola.com"
                required
                className={inputCls}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-white/70 mb-2 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`${inputCls} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-sm bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all border-0"
          >
            {loading ? (
              "A iniciar sessão..."
            ) : (
              <>
                Iniciar Sessão <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-white/50 mt-8">
          Ainda não tem conta?{" "}
          <Link
            href="/register"
            className="text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
          >
            Registar Escola
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}

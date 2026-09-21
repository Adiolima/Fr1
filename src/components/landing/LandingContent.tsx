"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, BookUser, CreditCard, Users, BarChart3, Shield } from "lucide-react";
import logoSrc from "@/assets/logo.png";

export default function LandingContent() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const handleCTA = () => {
    if (isAuthenticated) {
      router.push(user?.papel === "operador" ? "/assistentes" : "/painel");
    } else {
      router.push("/register");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoSrc.src} alt="Merkron" className="w-8 h-8 rounded-lg object-contain" />
            <span className="font-bold text-gray-900 text-lg">Merkron</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button
                onClick={() => router.push(user?.papel === "operador" ? "/assistentes" : "/painel")}
                className="h-9 text-sm bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg"
              >
                Ir para o Painel
              </Button>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
                  Iniciar Sessão
                </Link>
                <Button
                  onClick={() => router.push("/register")}
                  className="h-9 text-sm bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg"
                >
                  Registar Escola
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0a0a1a]">
        <div className="absolute inset-0">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px]" />
          <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[100px]" />
          <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[80px]" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl">
            <h2 className="text-white/60 text-sm font-medium tracking-wide uppercase mb-6">
              Plataforma de Comunicação Escolar
            </h2>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
              Transforme a comunicação da sua{" "}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                escola
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/50 leading-relaxed max-w-xl mb-10">
              Assistentes académicos com IA, gestão de contactos, pagamentos e muito mais. Tudo numa só plataforma.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleCTA}
                className="h-12 px-8 text-sm bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl flex items-center gap-2"
              >
                {isAuthenticated ? "Ir para o Painel" : "Começar Agora"} <ArrowRight className="w-4 h-4" />
              </Button>
              {!isAuthenticated && (
                <Link
                  href="/login"
                  className="h-12 px-8 inline-flex items-center text-sm text-white/70 hover:text-white font-medium rounded-xl border border-white/20 hover:border-white/40 transition-all"
                >
                  Iniciar Sessão
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">
              Tudo o que a sua escola precisa
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Ferramentas poderosas para simplificar a gestão académica e melhorar a comunicação.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Assistentes IA",
                description: "Assistentes académicos inteligentes que automatizam tarefas e respondem a perguntas de alunos e encarregados.",
                gradient: "from-purple-500 to-purple-600",
              },
              {
                icon: BookUser,
                title: "Base de Contactos",
                description: "Gira alunos, professores, encarregados e funcionários com uma base de contactos organizada e pesquisável.",
                gradient: "from-cyan-500 to-cyan-600",
              },
              {
                icon: BarChart3,
                title: "Estrutura Escolar",
                description: "Organize cursos, classes, turnos e turmas com uma hierarquia clara e fácil de gerir.",
                gradient: "from-emerald-500 to-emerald-600",
              },
              {
                icon: CreditCard,
                title: "Planos Flexíveis",
                description: "Escolha o plano que melhor se adapta à dimensão e necessidades da sua instituição.",
                gradient: "from-orange-500 to-orange-600",
              },
              {
                icon: Users,
                title: "Gestão de Equipa",
                description: "Convide administradores e operadores, defina permissões granulares por assistente e base de contactos.",
                gradient: "from-pink-500 to-pink-600",
              },
              {
                icon: Shield,
                title: "Segurança e Privacidade",
                description: "Dados encriptados, autenticação segura e conformidade com as melhores práticas de proteção de dados.",
                gradient: "from-indigo-500 to-indigo-600",
              },
            ].map((feature) => (
              <div key={feature.title} className="group relative p-8 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">
            Pronto para transformar a sua escola?
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8">
            Junte-se a centenas de instituições que já confiam na Merkron.
          </p>
          <Button
            onClick={handleCTA}
            className="h-12 px-8 text-sm bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl inline-flex items-center gap-2"
          >
            {isAuthenticated ? "Ir para o Painel" : "Registar Escola Gratuitamente"} <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoSrc.src} alt="Merkron" className="w-6 h-6 rounded object-contain" />
            <span className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Merkron. Todos os direitos reservados.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Iniciar Sessão</Link>
            <Link href="/register" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Registar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

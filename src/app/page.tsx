import type { Metadata } from "next";
import LandingContent from "@/components/landing/LandingContent";

export const metadata: Metadata = {
  title: "Plataforma de Comunicação Escolar",
  description:
    "Merkron conecta escolas, alunos e encarregados com assistentes IA, gestão de contactos, pagamentos e estrutura escolar completa.",
};

export default function LandingPage() {
  return <LandingContent />;
}

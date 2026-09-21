import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ProvidersWrapper from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://academica.merkron.com"),
  title: {
    template: "%s | Merkron",
    default: "Merkron — Plataforma de Comunicação Escolar",
  },
  description:
    "Merkron é a plataforma de comunicação escolar que conecta escolas, alunos, professores e encarregados. Gestão de contactos, assistentes IA, pagamentos e muito mais.",
  keywords: [
    "plataforma escolar",
    "comunicação escolar",
    "gestão académica",
    "assistente IA",
    "base de contactos",
    "Angola",
  ],
  authors: [{ name: "Merkron" }],
  alternates: {
    canonical: "https://academica.merkron.com",
  },
  openGraph: {
    title: "Merkron — Plataforma de Comunicação Escolar",
    description:
      "A plataforma inteligente que transforma a comunicação e gestão da sua instituição de ensino.",
    url: "https://academica.merkron.com",
    siteName: "Merkron",
    images: [
      {
        url: "/opengraph.jpg",
        width: 1200,
        height: 630,
        alt: "Merkron — Plataforma de Comunicação Escolar",
      },
    ],
    locale: "pt_AO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Merkron — Plataforma de Comunicação Escolar",
    description:
      "A plataforma inteligente que transforma a comunicação e gestão da sua instituição de ensino.",
    images: ["/opengraph.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/logo-favicon.png",
    shortcut: "/logo-favicon.png",
    apple: "/logo-favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className="light" suppressHydrationWarning>
      <body className={inter.className}>
        <ProvidersWrapper>{children}</ProvidersWrapper>
      </body>
    </html>
  );
}

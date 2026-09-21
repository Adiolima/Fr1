import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base de Contactos",
};

export default function BaseContactosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

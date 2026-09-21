import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planos",
};

export default function PlanosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Equipa",
};

export default function EquipaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

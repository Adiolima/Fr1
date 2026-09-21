import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Assistentes",
};

export default function AssistentesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

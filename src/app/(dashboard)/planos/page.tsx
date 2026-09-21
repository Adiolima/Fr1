import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function PlanosPage() {
  return (
    <div className="p-4 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Planos</h1>
        <p className="text-muted-foreground text-xs mt-0.5">Planos de subscrição.</p>
      </div>
      <Card className="shadow-sm border-dashed border-2 border-border bg-card/50">
        <CardContent className="p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">Planos</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Esta secção está em desenvolvimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

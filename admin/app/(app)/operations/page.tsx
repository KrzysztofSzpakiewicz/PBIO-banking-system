import type { Metadata } from "next";
import { Placeholder } from "@/components/ui/Placeholder";

export const metadata: Metadata = { title: "Operacje" };

export default function OperationsPage() {
  return (
    <Placeholder
      title="Operacje"
      description="Tu pojawi się podgląd wszystkich operacji w systemie, w tym prób odrzuconych."
    />
  );
}

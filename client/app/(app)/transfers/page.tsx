import type { Metadata } from "next";
import { Placeholder } from "@/components/ui/Placeholder";

export const metadata: Metadata = { title: "Przelewy" };

export default function TransfersPage() {
  return (
    <Placeholder
      title="Przelewy"
      description="Tu pojawi się formularz przelewu z podsumowaniem i potwierdzeniem operacji."
    />
  );
}

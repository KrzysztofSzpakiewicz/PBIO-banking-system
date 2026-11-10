import type { Metadata } from "next";
import { Placeholder } from "@/components/ui/Placeholder";

export const metadata: Metadata = { title: "Klienci" };

export default function ClientsPage() {
  return (
    <Placeholder
      title="Klienci"
      description="Tu pojawi się wyszukiwarka i szczegóły klientów."
    />
  );
}

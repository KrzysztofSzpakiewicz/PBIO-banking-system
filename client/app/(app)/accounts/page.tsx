import type { Metadata } from "next";
import { Placeholder } from "@/components/ui/Placeholder";

export const metadata: Metadata = { title: "Rachunki" };

export default function AccountsPage() {
  return (
    <Placeholder
      title="Rachunki"
      description="Tu pojawi się lista rachunków, otwieranie nowego rachunku, zmiana nazwy i zamykanie rachunku z zerowym saldem."
    />
  );
}

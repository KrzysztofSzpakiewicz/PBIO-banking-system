import type { Metadata } from "next";
import { Placeholder } from "@/components/ui/Placeholder";

export const metadata: Metadata = { title: "Rachunki" };

export default function AdminAccountsPage() {
  return (
    <Placeholder
      title="Rachunki"
      description="Tu pojawi się lista wszystkich rachunków i — jeśli zespół to ustali — zasilanie demonstracyjne sald."
    />
  );
}

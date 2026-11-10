import type { Metadata } from "next";
import { Placeholder } from "@/components/ui/Placeholder";

export const metadata: Metadata = { title: "Historia" };

export default function HistoryPage() {
  return (
    <Placeholder
      title="Historia operacji"
      description="Tu pojawi się stronicowana historia rachunku z filtrami po dacie i kierunku operacji."
    />
  );
}

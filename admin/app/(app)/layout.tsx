import { AppShell } from "@/components/layout/AppShell";
import { currentUser } from "@/lib/mock-data";

// Wspólny układ dla wszystkich stron po zalogowaniu.
// TODO: dane użytkownika z sesji zamiast mocka, przekierowanie na /login bez sesji.
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AppShell
      userName={`${currentUser.firstName} ${currentUser.lastName}`}
      userEmail={currentUser.email}
    >
      {children}
    </AppShell>
  );
}

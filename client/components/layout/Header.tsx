import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

type HeaderProps = {
  userName: string;
  userEmail: string;
  menuOpen: boolean;
  onToggleMenu: () => void;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Header({ userName, userEmail, menuOpen, onToggleMenu }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded focus:bg-brand focus:px-3 focus:py-2 focus:text-brand-foreground"
      >
        Przejdź do treści
      </a>

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onToggleMenu}
          aria-expanded={menuOpen}
          aria-controls="main-nav"
          aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
          className="-ml-2 rounded-md p-2 text-muted hover:bg-surface-muted hover:text-foreground lg:hidden"
        >
          <Icon name={menuOpen ? "close" : "menu"} />
        </button>

        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-brand text-sm font-bold text-brand-foreground">
            PB
          </span>
          <span className="text-lg tracking-tight">PBIO Bank</span>
        </Link>

        <span className="ml-2 hidden rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-medium text-brand sm:inline">
          Środowisko demo
        </span>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight">{userName}</p>
            <p className="text-xs text-muted">{userEmail}</p>
          </div>
          <span
            aria-hidden="true"
            className="grid size-9 place-items-center rounded-full bg-surface-muted text-sm font-semibold"
          >
            {initials(userName)}
          </span>
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm text-muted hover:bg-surface-muted hover:text-foreground"
          >
            <Icon name="logout" className="size-4" />
            <span className="sr-only md:not-sr-only">Wyloguj</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { NAV_ITEMS } from "@/lib/navigation";

type SidebarProps = {
  open: boolean;
  onNavigate: () => void;
};

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Tło przyciemniające pod wysuniętym menu na telefonie */}
      {open && (
        <div
          aria-hidden="true"
          onClick={onNavigate}
          className="fixed inset-0 top-16 z-20 bg-black/30 lg:hidden"
        />
      )}

      <nav
        id="main-nav"
        aria-label="Menu główne"
        className={`fixed inset-y-0 left-0 top-16 z-20 w-64 border-r border-border bg-surface px-3 py-6 transition-transform lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:bg-transparent ${
          open ? "translate-x-0" : "invisible -translate-x-full lg:visible"
        }`}
      >
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-brand-soft text-brand"
                      : "text-muted hover:bg-surface-muted hover:text-foreground"
                  }`}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 rounded-lg border border-dashed border-border p-3 text-xs leading-relaxed text-muted">
          Panel środowiska demonstracyjnego. Dane klientów i salda są fikcyjne.
        </div>
      </nav>
    </>
  );
}

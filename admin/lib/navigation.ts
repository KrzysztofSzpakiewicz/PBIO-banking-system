import type { IconName } from "@/components/ui/Icon";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Pulpit", icon: "home" },
  { href: "/clients", label: "Klienci", icon: "users" },
  { href: "/accounts", label: "Rachunki", icon: "wallet" },
  { href: "/operations", label: "Operacje", icon: "history" },
];

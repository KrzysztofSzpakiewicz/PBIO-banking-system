import type { IconName } from "@/components/ui/Icon";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Pulpit", icon: "home" },
  { href: "/accounts", label: "Rachunki", icon: "wallet" },
  { href: "/transfers", label: "Przelewy", icon: "transfer" },
  { href: "/history", label: "Historia", icon: "history" },
];

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Store, Wallet, GitBranch, Settings, Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/pipeline",    label: "Pipeline",    icon: GitBranch },
  { href: "/wallet",      label: "Wallet",      icon: Wallet },
  { href: "/settings",    label: "Ayarlar",     icon: Settings },
];

function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="flex items-center h-13 px-6 gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 mr-2">
          <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-black tracking-tight">AgentFlow</span>
        </Link>

        {/* Nav items */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-black text-white"
                    : "text-gray-400 hover:text-black hover:bg-gray-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">D</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-black leading-tight">Demo User</p>
            <p className="text-[10px] text-gray-400">Ücretsiz Plan</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <TopNav />
      <main>{children}</main>
    </div>
  );
}

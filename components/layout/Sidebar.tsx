"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  Wallet,
  GitBranch,
  Settings,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/marketplace", label: "Marketplace", icon: Store },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/settings", label: "Ayarlar", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-[#d0d7de] flex flex-col z-40">
      <div className="p-4 border-b border-[#d0d7de]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-[#1f2328] font-semibold text-base tracking-tight">AgentFlow</span>
        </Link>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-[#f6f8fa] text-[#1f2328] font-medium border border-[#d0d7de]"
                  : "text-[#656d76] hover:text-[#1f2328] hover:bg-[#f6f8fa]"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-violet-600" : ""}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#d0d7de]">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-sm">
            <span className="text-xs text-white font-semibold">D</span>
          </div>
          <div>
            <p className="text-xs text-[#1f2328] font-medium leading-tight">Demo User</p>
            <p className="text-[10px] text-[#9198a1]">Ücretsiz Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

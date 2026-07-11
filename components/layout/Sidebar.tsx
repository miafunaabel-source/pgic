"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, Car, ShoppingCart, Wrench,
  Megaphone, ChevronRight, Settings, LogOut, FolderOpen,
} from "lucide-react";
import NotificationsPanel from "@/components/layout/NotificationsPanel";
import { cn } from "@/lib/utils";
import { ROUTE_PERMISSIONS, ROLE_LABELS, ROLE_COLORS } from "@/lib/roles";
import type { Role } from "@/types/next-auth";

const ALL_NAV = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/clients", label: "Clients & CRM", icon: Users },
  { href: "/inventory", label: "Stocks Véhicules", icon: Car },
  { href: "/sales", label: "Ventes", icon: ShoppingCart },
  { href: "/workshop", label: "Atelier SAV", icon: Wrench },
  { href: "/documents", label: "Documents", icon: FolderOpen },
  { href: "/marketing", label: "Marketing", icon: Megaphone },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;

  // Filtre les liens selon le rôle
  const visibleNav = ALL_NAV.filter(({ href }) => {
    if (!role) return false;
    const allowed = ROUTE_PERMISSIONS[href];
    return allowed ? allowed.includes(role) : true;
  });

  const initials = session?.user?.name
    ? session.user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const companyName = (session?.user as any)?.company?.concession ?? "";

  return (
    <aside className="w-64 bg-[#0F2B5B] text-white flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-[#1A3A70]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shrink-0 ring-1 ring-blue-400/30">
            <span className="text-white font-bold text-sm tracking-tight">P</span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-none truncate">{companyName || "PGIC"}</p>
            <p className="text-slate-400 text-xs mt-0.5">Hub Digital Auto</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-blue-100/70 hover:bg-[#1A3A70] hover:text-white"
              )}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[#1A3A70] space-y-0.5">
        <NotificationsPanel />
        {role === "directeur" && (
          <Link href="/settings" className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname === "/settings" ? "bg-blue-600 text-white shadow-sm" : "text-blue-100/70 hover:bg-[#1A3A70] hover:text-white"
          )}>
            <Settings size={18} />
            <span className="flex-1">Paramètres</span>
            {pathname === "/settings" && <ChevronRight size={14} />}
          </Link>
        )}

        {/* User info + logout */}
        <div className="px-3 py-2 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ring-1 ring-blue-400/30">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{session?.user?.name ?? "..."}</p>
              {role && (
                <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", ROLE_COLORS[role])}>
                  {ROLE_LABELS[role]}
                </span>
              )}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-slate-400 hover:text-white transition-colors"
              title="Déconnexion"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

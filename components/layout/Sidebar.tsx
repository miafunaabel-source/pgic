"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, Car, ShoppingCart, Wrench,
  Megaphone, ChevronRight, Bell, Settings, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTE_PERMISSIONS, ROLE_LABELS, ROLE_COLORS } from "@/lib/roles";
import type { Role } from "@/types/next-auth";

const ALL_NAV = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/clients", label: "Clients & CRM", icon: Users },
  { href: "/inventory", label: "Stocks Véhicules", icon: Car },
  { href: "/sales", label: "Ventes", icon: ShoppingCart },
  { href: "/workshop", label: "Atelier SAV", icon: Wrench },
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

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <Car size={18} />
          </div>
          <div>
            <p className="font-bold text-sm leading-none">PGIC</p>
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
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <Bell size={18} />
          <span className="flex-1 text-left">Notifications</span>
          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">5</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
          <Settings size={18} />
          <span>Paramètres</span>
        </button>

        {/* User info + logout */}
        <div className="px-3 py-2 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
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

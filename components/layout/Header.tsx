"use client";
import { Search, Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: { label: string; onClick?: () => void };
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
          />
        </div>
        {action && (
          <button onClick={action.onClick} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

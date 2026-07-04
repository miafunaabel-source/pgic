import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  onClick?: () => void;
}

export default function StatCard({ title, value, change, icon: Icon, iconColor = "text-blue-600", iconBg = "bg-blue-50", onClick }: StatCardProps) {
  const positive = change !== undefined && change >= 0;
  return (
    <div className={cn("card p-5", onClick && "cursor-pointer hover:shadow-md transition-shadow")} onClick={onClick}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", positive ? "text-emerald-600" : "text-red-500")}>
              {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              <span>{positive ? "+" : ""}{change}% vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon size={22} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

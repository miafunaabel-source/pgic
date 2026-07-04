"use client";
import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, X, Check } from "lucide-react";
import Link from "next/link";
import { DEMO_NOTIFICATIONS, type Notification } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

const TYPE_CONFIG = {
  success: { Icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
  info: { Icon: Info, color: "text-blue-500", bg: "bg-blue-50" },
  warning: { Icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
  error: { Icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
};

function NotifDropdown({
  notifs,
  unreadCount,
  onClose,
  onMarkRead,
  onMarkAll,
}: {
  notifs: Notification[];
  unreadCount: number;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onMarkAll: () => void;
}) {
  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/20"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed left-[272px] bottom-16 z-[61] w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-600 text-xs font-medium px-1.5 py-0.5 rounded-full">
                {unreadCount} nouvelles
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAll}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <Check size={12} /> Tout lire
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
          {notifs.map(n => {
            const { Icon, color, bg } = TYPE_CONFIG[n.type];
            return (
              <div
                key={n.id}
                className={cn(
                  "flex gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer",
                  !n.read && "bg-blue-50/40"
                )}
                onClick={() => onMarkRead(n.id)}
              >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", bg)}>
                  <Icon size={15} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-medium leading-tight", n.read ? "text-slate-700" : "text-slate-900")}>
                      {n.title}
                    </p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 text-center">
          <Link
            href="/workshop"
            onClick={onClose}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Voir toutes les activités →
          </Link>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const unreadCount = notifs.filter(n => !n.read).length;

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
      >
        <Bell size={18} />
        <span className="flex-1 text-left">Notifications</span>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount}
          </span>
        )}
      </button>

      {open && mounted && (
        <NotifDropdown
          notifs={notifs}
          unreadCount={unreadCount}
          onClose={() => setOpen(false)}
          onMarkRead={markRead}
          onMarkAll={markAllRead}
        />
      )}
    </>
  );
}

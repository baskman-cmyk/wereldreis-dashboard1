import React from "react";
import { Bell, CheckCheck, AlertTriangle, Plane, CloudSun, FileText } from "lucide-react";
import { NotificationItem } from "../types";

interface MeldingenViewProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onToggleRead: (id: string) => void;
}

export const MeldingenView: React.FC<MeldingenViewProps> = ({
  notifications,
  onMarkAllRead,
  onToggleRead,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#39B8C8]" />
            Reismeldingen & Notificaties
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Belangrijke updates over vluchten, documenten, weer en budget.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#174A7E] hover:bg-[#1d5c9c] text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <CheckCheck className="w-4 h-4 text-[#39B8C8]" />
            <span>Alles als Gelezen Markeren</span>
          </button>
        )}
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {(notifications || []).map((n) => (
          <div
            key={n.id}
            onClick={() => onToggleRead(n.id)}
            className={`p-5 rounded-3xl border cursor-pointer transition flex items-start gap-4 ${
              !n.read
                ? "bg-[#174A7E]/5 dark:bg-[#39B8C8]/10 border-[#174A7E] dark:border-[#39B8C8] shadow-xs"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-75"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
                n.type === "flight"
                  ? "bg-blue-500/10 text-blue-600"
                  : n.type === "document"
                  ? "bg-amber-500/10 text-amber-600"
                  : n.type === "weather"
                  ? "bg-sky-500/10 text-sky-600"
                  : "bg-emerald-500/10 text-emerald-600"
              }`}
            >
              {n.type === "flight" && <Plane className="w-5 h-5" />}
              {n.type === "document" && <FileText className="w-5 h-5" />}
              {n.type === "weather" && <CloudSun className="w-5 h-5" />}
              {(n.type === "budget" || n.type === "camper" || n.type === "visa" || n.type === "medication" || n.type === "activity" || n.type === "checkin" || n.type === "passport" || n.type === "fuel") && <AlertTriangle className="w-5 h-5" />}
            </div>

            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white mb-1">
                <span className="text-sm">{n?.title || "Melding"}</span>
                <span className="text-slate-400 font-normal">{n?.date || (n as any)?.timestamp || ""}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {n?.description || (n as any)?.message || ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

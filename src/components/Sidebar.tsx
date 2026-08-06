import React from "react";
import { LayoutDashboard, CalendarDays, Map, Route, Wallet, Grid2X2 } from "lucide-react";
import { TabType } from "../types";

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  unreadNotifications: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, unreadNotifications }) => {
  const items = [
    { id: "today" as TabType, label: "Vandaag", icon: CalendarDays },
    { id: "dashboard" as TabType, label: "Overzicht", icon: LayoutDashboard },
    { id: "reisplanning" as TabType, label: "Reisplanning", icon: Map },
    { id: "navigatie" as TabType, label: "Kaart & route", icon: Route },
    { id: "budget" as TabType, label: "Budget", icon: Wallet },
    { id: "more" as TabType, label: "Meer", icon: Grid2X2, badge: unreadNotifications },
  ];

  return (
    <aside className="sticky top-20 hidden h-fit w-60 shrink-0 flex-col rounded-3xl border border-slate-200 bg-white/85 p-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 lg:flex">
      <div className="px-3 pb-3 pt-2">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Navigatie</p>
      </div>
      <nav aria-label="Hoofdnavigatie" className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={active ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${active ? "bg-[#174A7E] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-cyan-300" : "text-slate-400"}`} />
              <span>{item.label}</span>
              {!!item.badge && item.id === "more" && (
                <span className="ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-[10px] text-white">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="mt-5 rounded-2xl bg-[#F3E7C8]/55 p-3 text-xs leading-5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        Alle overige functies staan overzichtelijk onder <strong>Meer</strong>.
      </div>
    </aside>
  );
};

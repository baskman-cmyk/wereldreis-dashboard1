import React from "react";
import { CalendarDays, Map, Route, Wallet, Grid2X2 } from "lucide-react";
import { TabType } from "../types";

interface MobileNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  unreadNotifications: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, unreadNotifications }) => {
  const items = [
    { id: "today" as TabType, label: "Vandaag", icon: CalendarDays },
    { id: "reisplanning" as TabType, label: "Reis", icon: Map },
    { id: "navigatie" as TabType, label: "Kaart", icon: Route },
    { id: "budget" as TabType, label: "Budget", icon: Wallet },
    { id: "more" as TabType, label: "Meer", icon: Grid2X2, badge: unreadNotifications },
  ];

  return (
    <nav aria-label="Hoofdnavigatie" className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-white/10 bg-[#174A7E] px-1 py-1.5 text-white shadow-2xl lg:hidden">
      {items.map((item) => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-w-14 flex-col items-center py-1 text-[10px] font-bold ${active ? "text-cyan-300" : "text-white/70"}`}
          >
            <Icon className="mb-1 h-5 w-5" />
            {item.label}
            {!!item.badge && item.id === "more" && (
              <span className="absolute right-2 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] text-white">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

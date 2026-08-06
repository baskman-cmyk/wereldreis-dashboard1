import React from "react";
import {
  Search,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Download,
  Bell,
  Sparkles,
  Compass,
} from "lucide-react";
import { TripOverview, TabType } from "../types";

interface NavbarProps {
  overview: TripOverview;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  isOnline: boolean;
  unreadNotificationsCount: number;
  onOpenAssistant: () => void;
  onOpenExport: () => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  overview,
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  isOnline,
  unreadNotificationsCount,
  onOpenAssistant,
  onOpenExport,
  onOpenSearch,
}) => {
  return (
    <header aria-label="Bovenbalk" className="sticky top-0 z-40 bg-[#174A7E] text-white shadow-md border-b border-[#39B8C8]/30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <button type="button" className="flex items-center gap-3 text-left" onClick={() => setActiveTab("dashboard")} aria-label="Ga naar overzicht">
          <div className="w-10 h-10 rounded-xl bg-[#39B8C8] text-[#174A7E] flex items-center justify-center font-bold shadow-sm">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight flex items-center gap-2 text-white">
              {overview?.title || "Wereldreis 2026"}
            </h1>
            <p className="text-xs text-[#F3E7C8] opacity-90 font-medium">
              Dag {overview?.currentDay || 1} van {overview?.totalDays || 150} • {overview?.currentCity || ""}, {overview?.currentCountry || ""}
            </p>
          </div>
        </button>

        {/* Global Search Bar (Trigger) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white/80 hover:text-white rounded-full text-sm border border-white/15 backdrop-blur-sm transition"
          >
            <Search className="w-4 h-4 text-[#39B8C8]" />
            <span className="flex-1 text-left truncate">Zoek documenten, boekingen, wifi, plekken...</span>
            <kbd className="hidden lg:inline-block px-2 py-0.5 text-[10px] font-semibold bg-white/20 text-white rounded">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Travel Assistant Button */}
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-[#39B8C8] to-[#2aa2b2] text-[#174A7E] font-semibold text-xs sm:text-sm rounded-full shadow-sm hover:brightness-105 transition transform active:scale-95"
            title="Open AI Reisassistent"
          >
            <Sparkles className="w-4 h-4 text-[#174A7E]" />
            <span className="hidden sm:inline">AI Assistent</span>
          </button>

          {/* Search Mobile Button */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 rounded-full hover:bg-white/10 text-white"
            title="Zoeken"
          >
            <Search className="w-5 h-5 text-[#39B8C8]" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => setActiveTab("meldingen")}
            className="relative p-2 rounded-full hover:bg-white/10 text-white transition"
            title="Meldingen"
          >
            <Bell className="w-5 h-5 text-white/90" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Export & Sync */}
          <button
            onClick={onOpenExport}
            className="p-2 rounded-full hover:bg-white/10 text-white transition"
            title="Exporteren & Back-up"
          >
            <Download className="w-5 h-5 text-[#F3E7C8]" />
          </button>

          {/* Dark/Light mode toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-white/10 text-white transition"
            title={isDarkMode ? "Lichte modus" : "Donkere modus"}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-[#F3E7C8]" />
            ) : (
              <Moon className="w-5 h-5 text-white/90" />
            )}
          </button>

          {/* Offline Status Indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isOnline
                ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30"
                : "bg-amber-500/30 text-amber-200 border border-amber-400/40"
            }`}
            title={isOnline ? "Verbonden met internet (AI Actief)" : "Offline Modus (Lokale data beschikbaar)"}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden xl:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden xl:inline">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

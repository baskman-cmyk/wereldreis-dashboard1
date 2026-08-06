import React from "react";
import { BarChart3, Globe2, Wallet, Navigation } from "lucide-react";
import { CategoryBudget, TripOverview } from "../types";

interface StatistiekenViewProps {
  categoryBudgets: CategoryBudget[];
  overview: TripOverview;
}

export const StatistiekenView: React.FC<StatistiekenViewProps> = ({
  categoryBudgets,
  overview,
}) => {
  const maxBudget = Math.max(...categoryBudgets.map((c) => c.budgetEur));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#39B8C8]" />
            Reisstatistieken & Grafieken
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Grafische overzichten van uitgaven, afgelegde afstanden en dagverdeling.
          </p>
        </div>
      </div>

      {/* Budget Category Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#174A7E] dark:text-[#39B8C8]" /> Uitgaven per Categorie (€)
        </h3>

        <div className="space-y-3 pt-2">
          {categoryBudgets.map((cat) => {
            const widthPercent = (cat.spentEur / maxBudget) * 100;
            return (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{cat.label || cat.category}</span>
                  <span className="text-slate-900 dark:text-white font-bold">
                    €{cat.spentEur.toLocaleString()} / €{cat.budgetEur.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#174A7E] to-[#39B8C8] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, widthPercent)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Country Days Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-[#39B8C8]" /> Dagen per Land
          </h3>

          <div className="space-y-3 text-xs font-semibold">
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <span>🇸🇬 Singapore</span>
              <span className="font-bold text-slate-900 dark:text-white">4 Dagen</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <span>🇮🇩 Indonesia (Bali)</span>
              <span className="font-bold text-slate-900 dark:text-white">14 Dagen</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <span>🇦🇺 Australia (Camper Roadtrip)</span>
              <span className="font-bold text-slate-900 dark:text-white">45 Dagen</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <span>🇳🇿 New Zealand</span>
              <span className="font-bold text-slate-900 dark:text-white">35 Dagen</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <span>🇺🇸 United States (National Parks)</span>
              <span className="font-bold text-slate-900 dark:text-white">52 Dagen</span>
            </div>
          </div>
        </div>

        {/* Distance Metrics */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#39B8C8]" /> Afstand & Vlieguren
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400">Totale Vliegtijd</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">48.5 Uur in de Lucht</p>
                <p className="text-xs text-slate-500">6 Vluchten in totaal</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400">Camper & Huurauto KM</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{overview.totalKmTraveled.toLocaleString()} KM Gereden</p>
                <p className="text-xs text-slate-500">Australië (4.200km) + USA (6.800km) + NZ (3.850km)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

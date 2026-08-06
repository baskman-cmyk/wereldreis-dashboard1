import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Home,
  Sparkles,
  Camera,
  Wallet,
  CheckCircle2,
  Plus,
  RefreshCw,
  FileText,
} from "lucide-react";
import { TimelineDay, ExpenseItem } from "../types";

interface TimelineViewProps {
  timeline: TimelineDay[];
  onAddDay: (newDay: TimelineDay) => void;
  onUpdateDay: (updated: TimelineDay) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  timeline = [],
  onAddDay,
  onUpdateDay,
}) => {
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [filterLand, setFilterLand] = useState<string>("alle");

  const timelineList = timeline || [];
  const countriesList = Array.from(new Set(timelineList.map((d) => d.land)));

  const filteredTimeline =
    filterLand === "alle"
      ? timelineList
      : timelineList.filter((d) => d.land === filterLand);

  const handleGenerateSummary = async (day: TimelineDay) => {
    setSummarizingId(day.id);
    try {
      const res = await fetch("/api/ai/summarize-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayData: day }),
      });
      const data = await res.json();
      if (data.summary) {
        onUpdateDay({ ...day, samenvatting: data.summary });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSummarizingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#39B8C8]" />
            Tijdlijn van de Reis
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Volledig overzicht per reisdag met overnachting, foto's, uitgaven en AI samenvatting.
          </p>
        </div>

        {/* Filter per Country */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Filter Land:</label>
          <select
            value={filterLand}
            onChange={(e) => setFilterLand(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <option value="alle">Alle Landen ({timeline.length} Dagen)</option>
            {countriesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vertical Timeline Tree */}
      <div className="relative border-l-2 border-[#39B8C8]/40 ml-4 sm:ml-6 space-y-8 pl-6 sm:pl-8">
        {filteredTimeline.map((day) => {
          const totalExpensesEur = day.uitgaven.reduce(
            (sum, u) => sum + u.amountEur,
            0
          );

          return (
            <div key={day.id} className="relative group">
              {/* Day Marker Badge on Line */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-8 h-8 rounded-full bg-[#174A7E] text-white border-2 border-white dark:border-slate-900 flex items-center justify-center font-black text-xs shadow-md">
                {day.dayNumber}
              </div>

              {/* Day Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition">
                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <div>
                    <span className="text-xs font-bold text-[#39B8C8] uppercase tracking-wider">
                      {day.date} • {day.land}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                      <MapPin className="w-4 h-4 text-[#174A7E] dark:text-[#39B8C8]" />
                      {day.plaats}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#F3E7C8] dark:bg-slate-800 text-[#174A7E] dark:text-[#39B8C8] text-xs font-bold rounded-full flex items-center gap-1.5">
                      <Home className="w-3.5 h-3.5" />
                      {day.overnachting}
                    </span>
                  </div>
                </div>

                {/* Activities & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Activiteiten van de dag
                    </h4>
                    <ul className="space-y-1.5">
                      {day.activiteiten.map((act, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Notities & Indrukken
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                      "{day.notities}"
                    </p>
                  </div>
                </div>

                {/* Photos Grid */}
                {day.fotos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" /> Foto's ({day.fotos.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {day.fotos.map((imgUrl, idx) => (
                        <img
                          key={idx}
                          src={imgUrl}
                          alt={`Foto Dag ${day.dayNumber}`}
                          className="w-full h-24 object-cover rounded-xl shadow-2xs hover:scale-105 transition"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Expenses & GPS Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Wallet className="w-4 h-4 text-emerald-600" /> Uitgaven:{" "}
                      <strong className="text-slate-900 dark:text-white">
                        €{totalExpensesEur.toFixed(2)}
                      </strong>
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">
                      GPS: {day.gps.lat.toFixed(4)}, {day.gps.lng.toFixed(4)}
                    </span>
                  </div>

                  {/* AI Summary Button */}
                  <button
                    onClick={() => handleGenerateSummary(day)}
                    disabled={summarizingId === day.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#39B8C8]/20 hover:bg-[#39B8C8]/30 text-[#174A7E] dark:text-[#39B8C8] text-xs font-bold rounded-xl transition"
                  >
                    {summarizingId === day.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {day.samenvatting
                        ? "AI Samenvatting Bijwerken"
                        : "AI Dag Samenvatting Genereren"}
                    </span>
                  </button>
                </div>

                {/* Display AI Summary Box */}
                {day.samenvatting && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-[#174A7E]/10 to-[#39B8C8]/10 rounded-xl border border-[#39B8C8]/30 text-xs text-[#174A7E] dark:text-[#39B8C8] font-medium flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#39B8C8] shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-slate-900 dark:text-white">
                        AI Samenvatting:
                      </strong>
                      <p>{day.samenvatting}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

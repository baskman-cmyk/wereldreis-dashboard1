import React, { useMemo, useState } from "react";
import { CheckSquare, Check, Search, Plane, ArrowRightLeft, AlertTriangle, Circle } from "lucide-react";
import { ChecklistItem } from "../types";

interface ChecklistViewProps {
  checklists: ChecklistItem[];
  onToggleCheckItem: (groupId: string, itemId: string) => void;
}

export const ChecklistView: React.FC<ChecklistViewProps> = ({ checklists, onToggleCheckItem }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);

  const countries = useMemo(
    () => ["all", ...Array.from(new Set(checklists.map((item) => item.countryScope).filter(Boolean) as string[]))],
    [checklists]
  );

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return checklists.filter((item) => {
      const categoryMatches = activeCategory === "all" || item.category === activeCategory;
      const countryMatches = countryFilter === "all" || item.countryScope === countryFilter;
      const completionMatches = showCompleted || !item.completed;
      const queryMatches = !query || item.text.toLowerCase().includes(query) || item.countryScope?.toLowerCase().includes(query);
      return categoryMatches && countryMatches && completionMatches && queryMatches;
    });
  }, [activeCategory, checklists, countryFilter, searchQuery, showCompleted]);

  const completedCount = checklists.filter((item) => item.completed).length;
  const openCount = checklists.length - completedCount;
  const progress = checklists.length ? Math.round((completedCount / checklists.length) * 100) : 0;
  const departureOpen = checklists.filter((item) => item.category === "pre-departure" && !item.completed).length;
  const transitionOpen = checklists.filter((item) => item.category === "country-transition" && !item.completed).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <section className="rounded-3xl bg-gradient-to-br from-[#174A7E] to-[#245f8f] p-6 text-white shadow-lg">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#9ee8ef]">Acties & deadlines</p>
            <h2 className="flex items-center gap-3 text-2xl font-black"><CheckSquare className="h-7 w-7 text-[#56d2df]" /> Reischecklists</h2>
            <p className="mt-2 max-w-2xl text-sm text-blue-100">Alle belangrijke handelingen voor vertrek en bij de overgang naar een volgend land.</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 text-right backdrop-blur-sm">
            <div className="text-3xl font-black">{progress}%</div>
            <div className="text-xs font-bold text-blue-100">{completedCount} van {checklists.length} voltooid</div>
          </div>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-[#56d2df]" style={{ width: `${progress}%` }} /></div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <button onClick={() => setActiveCategory("all")} className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Circle className="h-5 w-5 text-[#39B8C8]" />
          <div className="mt-4 text-2xl font-black text-slate-900 dark:text-white">{openCount}</div>
          <div className="text-xs font-bold text-slate-500">Openstaande acties</div>
        </button>
        <button onClick={() => setActiveCategory("pre-departure")} className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Plane className="h-5 w-5 text-[#174A7E] dark:text-[#56d2df]" />
          <div className="mt-4 text-2xl font-black text-slate-900 dark:text-white">{departureOpen}</div>
          <div className="text-xs font-bold text-slate-500">Voor vertrek</div>
        </button>
        <button onClick={() => setActiveCategory("country-transition")} className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ArrowRightLeft className="h-5 w-5 text-[#174A7E] dark:text-[#56d2df]" />
          <div className="mt-4 text-2xl font-black text-slate-900 dark:text-white">{transitionOpen}</div>
          <div className="text-xs font-bold text-slate-500">Landovergangen</div>
        </button>
      </section>

      {openCount > 0 && (
        <section className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div><h3 className="text-sm font-black text-amber-950 dark:text-amber-100">Nog {openCount} acties open</h3><p className="mt-1 text-xs text-amber-800 dark:text-amber-300">Rond vooral visa, paspoorten, medicatieverklaringen en betaalmiddelen ruim voor vertrek af.</p></div>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Zoek actie of land" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800" /></div>
          <select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"><option value="all">Alle fases</option><option value="pre-departure">Voor vertrek</option><option value="country-transition">Landovergangen</option></select>
          <select value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"><option value="all">Alle landen</option>{countries.filter((country) => country !== "all").map((country) => <option key={country}>{country}</option>)}</select>
          <label className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300"><input type="checkbox" checked={showCompleted} onChange={(event) => setShowCompleted(event.target.checked)} className="accent-[#174A7E]" /> Toon voltooid</label>
        </div>
      </section>

      <section className="space-y-3">
        {filtered.map((item) => (
          <button key={item.id} onClick={() => onToggleCheckItem(item.category, item.id)} className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${item.completed ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20" : "border-slate-200 bg-white hover:border-[#39B8C8] dark:border-slate-800 dark:bg-slate-900"}`}>
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${item.completed ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800"}`}>{item.completed && <Check className="h-4 w-4" />}</span>
            <span className="min-w-0 flex-1"><span className={`block text-sm font-black text-slate-900 dark:text-white ${item.completed ? "line-through opacity-65" : ""}`}>{item.text}</span><span className="mt-2 flex flex-wrap gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800">{item.category === "pre-departure" ? "Voor vertrek" : "Landovergang"}</span>{item.countryScope && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#174A7E] dark:bg-blue-950/40 dark:text-blue-200">{item.countryScope}</span>}</span></span>
          </button>
        ))}
      </section>

      {!filtered.length && <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700">Geen checklistpunten gevonden met deze filters.</div>}
    </div>
  );
};

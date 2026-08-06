import React, { useState } from "react";
import { Search, X, FileText, Home, MapPin, Ticket, BookOpen, Wallet, Wifi } from "lucide-react";
import { TripDataState, TabType } from "../types";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TripDataState;
  setActiveTab: (tab: TabType) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  data,
  setActiveTab,
}) => {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Perform search matching across multiple collections
  const results = {
    documents: data.documents.filter(
      (d) =>
        d.titel.toLowerCase().includes(q) ||
        d.categorie.toLowerCase().includes(q) ||
        d.notes.toLowerCase().includes(q)
    ),
    accommodations: data.accommodations.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.stad.toLowerCase().includes(q) ||
        a.wifiCode.toLowerCase().includes(q) ||
        a.boekingsnummer.toLowerCase().includes(q)
    ),
    locations: data.savedLocations.filter(
      (l) =>
        l.naam.toLowerCase().includes(q) ||
        l.adres.toLowerCase().includes(q) ||
        l.notities.toLowerCase().includes(q)
    ),
    activities: data.activities.filter(
      (act) =>
        act.name.toLowerCase().includes(q) ||
        act.description.toLowerCase().includes(q) ||
        act.location.toLowerCase().includes(q)
    ),
    journals: data.journals.filter(
      (j) =>
        j.tekst.toLowerCase().includes(q) ||
        j.hoogtepunt.toLowerCase().includes(q) ||
        j.plaats.toLowerCase().includes(q)
    ),
    expenses: data.budgetExpenses.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.country.toLowerCase().includes(q)
    ),
  };

  const hasResults =
    q.length > 0 &&
    (results.documents.length > 0 ||
      results.accommodations.length > 0 ||
      results.locations.length > 0 ||
      results.activities.length > 0 ||
      results.journals.length > 0 ||
      results.expenses.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Input Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-[#39B8C8] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek documenten, wifi-wachtwoorden, campings, uitgaven..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-base"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {q.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50 text-[#39B8C8]" />
              <p>Typ een zoekwoord (bijv. "Wifi", "Noosa", "Paspoort", "Zion")</p>
            </div>
          ) : !hasResults ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <p>Geen resultaten gevonden voor "{query}".</p>
            </div>
          ) : (
            <>
              {/* Accommodations */}
              {results.accommodations.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#174A7E] dark:text-[#39B8C8] mb-2 flex items-center gap-1.5">
                    <Home className="w-4 h-4" /> Accommodaties ({results.accommodations.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.accommodations.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          setActiveTab("accommodaties");
                          onClose();
                        }}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-[#F3E7C8]/50 dark:hover:bg-slate-800 cursor-pointer transition flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{a.name}</p>
                          <p className="text-xs text-slate-500">{a.stad}, {a.land} • Boeking #{a.boekingsnummer}</p>
                        </div>
                        {a.wifiCode && (
                          <div className="flex items-center gap-1 text-xs font-mono font-bold bg-[#39B8C8]/20 text-[#174A7E] dark:text-[#39B8C8] px-2 py-1 rounded-md">
                            <Wifi className="w-3 h-3" /> {a.wifiCode}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {results.documents.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#174A7E] dark:text-[#39B8C8] mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Documenten ({results.documents.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.documents.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          setActiveTab("documenten");
                          onClose();
                        }}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-[#F3E7C8]/50 dark:hover:bg-slate-800 cursor-pointer transition"
                      >
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{d.titel}</p>
                        <p className="text-xs text-slate-500">{d.categorie} • {d.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Saved Locations */}
              {results.locations.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#174A7E] dark:text-[#39B8C8] mb-2 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> Bewaarde Plekken ({results.locations.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.locations.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => {
                          setActiveTab("navigatie");
                          onClose();
                        }}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-[#F3E7C8]/50 dark:hover:bg-slate-800 cursor-pointer transition"
                      >
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{l.naam}</p>
                        <p className="text-xs text-slate-500">{l.adres}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activities */}
              {results.activities.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#174A7E] dark:text-[#39B8C8] mb-2 flex items-center gap-1.5">
                    <Ticket className="w-4 h-4" /> Activiteiten ({results.activities.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.activities.map((act) => (
                      <div
                        key={act.id}
                        onClick={() => {
                          setActiveTab("activiteiten");
                          onClose();
                        }}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-[#F3E7C8]/50 dark:hover:bg-slate-800 cursor-pointer transition"
                      >
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{act.name}</p>
                        <p className="text-xs text-slate-500">{act.location} • €{act.priceEur}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expenses */}
              {results.expenses.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#174A7E] dark:text-[#39B8C8] mb-2 flex items-center gap-1.5">
                    <Wallet className="w-4 h-4" /> Uitgaven ({results.expenses.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.expenses.map((e) => (
                      <div
                        key={e.id}
                        onClick={() => {
                          setActiveTab("budget");
                          onClose();
                        }}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl hover:bg-[#F3E7C8]/50 dark:hover:bg-slate-800 cursor-pointer transition flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">{e.description}</p>
                          <p className="text-xs text-slate-500">{e.date} • {e.category} ({e.paidBy})</p>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          €{e.amountEur.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

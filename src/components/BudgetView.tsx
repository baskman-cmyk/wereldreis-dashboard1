import React, { useState } from "react";
import {
  Wallet,
  Plus,
  Sparkles,
  Search,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";
import { ExpenseItem, CategoryBudget } from "../types";
import { exportBudgetToCSV } from "../utils/storage";

interface BudgetViewProps {
  expenses: ExpenseItem[];
  categoryBudgets: CategoryBudget[];
  onAddExpense: (exp: ExpenseItem) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  expenses,
  categoryBudgets,
  onAddExpense,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // New Expense Form State
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState<ExpenseItem["category"]>("eten");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("Bas");
  const [country, setCountry] = useState("Australië");

  const totalBudget = categoryBudgets.reduce((acc, c) => acc + c.budgetEur, 0);
  const spentByCategory = new Map<ExpenseItem["category"], number>();
  expenses.forEach((expense) => spentByCategory.set(expense.category, (spentByCategory.get(expense.category) || 0) + expense.amountEur));
  const totalSpent = expenses.reduce((acc, expense) => acc + expense.amountEur, 0);
  const remainingEur = totalBudget - totalSpent;

  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = selectedCategory === "all" || e.category === selectedCategory;
    const matchesQ =
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.country.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQ;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount) return;
    const parsedAmount = parseFloat(amount);
    const newExp: ExpenseItem = {
      id: "exp-" + Date.now(),
      date: new Date().toLocaleDateString("nl-NL"),
      description: desc,
      category,
      amountOriginal: parsedAmount,
      currency: "EUR",
      amountEur: parsedAmount,
      paidBy,
      country,
    };
    onAddExpense(newExp);
    setDesc("");
    setAmount("");
    setShowAddForm(false);
  };

  const handleAnalyzeBudget = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/analyze-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryBudgets,
          expensesSummary: expenses.slice(0, 10),
        }),
      });
      const data = await res.json();
      setAiAdvice(data.advice || "Geen advies ontvangen.");
    } catch (err) {
      console.error(err);
      setAiAdvice("Er is een fout opgetreden bij het genereren van AI advies.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#39B8C8]" />
            Budget & Uitgaven Overzicht
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Realtime inzicht in alle reisuitgaven per categorie, wie wat betaald heeft en AI budgetanalyse.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportBudgetToCSV(expenses)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-300 dark:border-emerald-800 transition"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export CSV
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#174A7E] hover:bg-[#1d5c9c] text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4 text-[#39B8C8]" /> Uitgave Loggen
          </button>
        </div>
      </div>

      {/* Main Budget Progress Card */}
      <div className="bg-gradient-to-r from-[#174A7E] to-[#1d5c9c] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="text-xs text-[#F3E7C8] uppercase font-bold tracking-wider">
              Totaal Reisbudget
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl sm:text-4xl font-black">
                €{totalSpent.toLocaleString()}
              </span>
              <span className="text-sm text-[#F3E7C8]">
                van €{totalBudget.toLocaleString()} Totaal
              </span>
            </div>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl border border-white/20 text-right shrink-0">
            <span className="text-[10px] text-[#F3E7C8] uppercase font-bold block">Resterend Budget</span>
            <span className="text-2xl font-black text-[#39B8C8]">
              €{remainingEur.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/20 h-3.5 rounded-full overflow-hidden mt-6">
          <div
            className="bg-[#39B8C8] h-full rounded-full transition-all duration-500 shadow-md"
            style={{ width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%` }}
          />
        </div>

        {/* AI Budget Advice Trigger */}
        <div className="mt-4 pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-[#F3E7C8]">
            Vraag Gemini AI om bespaartips en dagbudget-prognoses op basis van huidige uitgaven.
          </p>
          <button
            onClick={handleAnalyzeBudget}
            disabled={isAiLoading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#39B8C8] text-[#174A7E] font-bold text-xs rounded-xl shadow-md hover:bg-[#4ed0e0] transition shrink-0"
          >
            {isAiLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#174A7E]" />
            )}
            <span>AI Budget Advies Opvragen</span>
          </button>
        </div>

        {aiAdvice && (
          <div className="mt-4 p-4 bg-white/10 rounded-2xl border border-white/20 text-xs leading-relaxed text-[#F3E7C8] font-medium animate-in fade-in duration-200">
            <strong className="block text-white text-sm mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#39B8C8]" /> AI Budget Advies:
            </strong>
            <p className="whitespace-pre-wrap">{aiAdvice}</p>
          </div>
        )}
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddSubmit}
          className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4 animate-in zoom-in-95 duration-150"
        >
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Nieuwe Uitgave Invoeren
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Omschrijving (bijv. Boodschappen Coles)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 sm:col-span-2"
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Bedrag in EUR (€) *"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700"
              required
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700"
            >
              <option value="eten">Eten & drinken</option>
              <option value="boodschappen">Boodschappen</option>
              <option value="vluchten">Vliegtickets</option>
              <option value="vervoer">Auto, camper & vervoer</option>
              <option value="brandstof">Brandstof</option>
              <option value="tol">Tol</option>
              <option value="parkeren">Parkeren</option>
              <option value="campings">Campings</option>
              <option value="hotels">Accommodaties</option>
              <option value="activiteiten">Activiteiten</option>
              <option value="verzekeringen">Verzekeringen</option>
              <option value="visa">Visa</option>
              <option value="internet">Internet & simkaart</option>
              <option value="kleding">Kleding</option>
              <option value="souvenirs">Souvenirs</option>
              <option value="onvoorzien">Onvoorzien</option>
              <option value="overig">Overig</option>
            </select>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700"
            >
              <option value="Bas">Betaald door Bas</option>
              <option value="Maartje">Betaald door Maartje</option>
              <option value="Gezamenlijke Pot">Gezamenlijke Pot</option>
            </select>
            <input
              type="text"
              placeholder="Land"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 sm:col-span-3"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-500"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#39B8C8] text-[#174A7E] font-bold text-xs rounded-xl"
            >
              Opslaan
            </button>
          </div>
        </form>
      )}

      {/* Categories Breakdown Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryBudgets.map((cat) => {
          const spent = spentByCategory.get(cat.category) || 0;
          const catPercent = cat.budgetEur > 0 ? Math.min(100, Math.round((spent / cat.budgetEur) * 100)) : 0;
          return (
            <div
              key={cat.category}
              className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {cat.label || cat.category}
                </span>
                <span className="text-xs font-bold text-[#174A7E] dark:text-[#39B8C8]">
                  {catPercent}%
                </span>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                €{spent.toLocaleString("nl-NL", { maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                van €{cat.budgetEur.toLocaleString("nl-NL", { maximumFractionDigits: 2 })}
              </p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-[#174A7E] dark:bg-[#39B8C8] h-full rounded-full"
                  style={{ width: `${catPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Expense History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Geregistreerde Uitgaven ({filteredExpenses.length})
          </h3>

          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Zoek uitgave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 uppercase text-[10px] text-slate-400 font-bold">
              <tr>
                <th className="p-3 rounded-l-xl">Datum</th>
                <th className="p-3">Omschrijving</th>
                <th className="p-3">Categorie</th>
                <th className="p-3">Betaald Door</th>
                <th className="p-3">Land</th>
                <th className="p-3 rounded-r-xl text-right">Bedrag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id}>
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{exp.date}</td>
                  <td className="p-3 font-medium">{exp.description}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-bold capitalize">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-3 font-medium">{exp.paidBy}</td>
                  <td className="p-3 text-slate-500">{exp.country}</td>
                  <td className="p-3 font-black text-slate-900 dark:text-white text-right">
                    €{exp.amountEur.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

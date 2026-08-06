import React, { useState } from "react";
import { Coins, ArrowRightLeft, DollarSign } from "lucide-react";

interface ValutaViewProps {
  currencies: Record<string, number>;
}

export const ValutaView: React.FC<ValutaViewProps> = ({ currencies }) => {
  const [amount, setAmount] = useState<string>("100");
  const [fromCurr, setFromCurr] = useState<string>("EUR");
  const [toCurr, setToCurr] = useState<string>("AUD");

  const valEur = fromCurr === "EUR" ? parseFloat(amount) || 0 : (parseFloat(amount) || 0) / (currencies[fromCurr] || 1);
  const resultVal = toCurr === "EUR" ? valEur : valEur * (currencies[toCurr] || 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-[#39B8C8]" />
            Valuta Converter & Live Koersen
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Reken snel bedragen om tussen Euro, Australische Dollar, Nieuw-Zeelandse Dollar, US Dollar en Rupea.
          </p>
        </div>
      </div>

      {/* Converter Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm max-w-xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Bedrag & Valuta Van</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl text-base font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700"
              />
              <select
                value={fromCurr}
                onChange={(e) => setFromCurr(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-xs font-bold p-3 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                <option value="EUR">EUR (€)</option>
                <option value="AUD">AUD ($)</option>
                <option value="NZD">NZD ($)</option>
                <option value="USD">USD ($)</option>
                <option value="SGD">SGD ($)</option>
                <option value="IDR">IDR (Rp)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Omgerekend Naar</label>
            <div className="flex gap-2">
              <div className="w-full bg-[#F3E7C8]/50 dark:bg-slate-800 p-3 rounded-2xl text-base font-black text-[#174A7E] dark:text-[#39B8C8] border border-[#F3E7C8] dark:border-slate-700 flex items-center">
                {resultVal.toFixed(2)}
              </div>
              <select
                value={toCurr}
                onChange={(e) => setToCurr(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-xs font-bold p-3 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                <option value="AUD">AUD ($)</option>
                <option value="NZD">NZD ($)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="SGD">SGD ($)</option>
                <option value="IDR">IDR (Rp)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Rates Overview */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Wisselkoersen t.o.v. 1 Euro (€)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(currencies).map(([code, rate]) => (
              <div
                key={code}
                className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs flex items-center justify-between"
              >
                <span className="font-bold text-slate-700 dark:text-slate-300">1 EUR</span>
                <span className="font-mono font-black text-[#174A7E] dark:text-[#39B8C8]">
                  {rate} {code}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

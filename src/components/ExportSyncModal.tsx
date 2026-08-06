import React, { useMemo, useRef, useState } from "react";
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileCode,
  BookOpen,
  X,
  RefreshCw,
  Check,
  HardDrive,
  RotateCcw,
} from "lucide-react";
import { TripDataState } from "../types";
import {
  exportToJSON,
  exportBudgetToCSV,
  exportTravelBookHTML,
  resetTripData,
  saveTripData,
  createRecoveryPoint,
  restoreRecoveryPoint,
  validateImportedTripData,
  getStorageStatus,
} from "../utils/storage";

interface ExportSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TripDataState;
  onDataLoaded: (newData: TripDataState) => void;
}

export const ExportSyncModal: React.FC<ExportSyncModalProps> = ({
  isOpen,
  onClose,
  data,
  onDataLoaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string>("");
  const storageStatus = useMemo(() => getStorageStatus(), [isOpen, data]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = validateImportedTripData(JSON.parse(evt.target?.result as string));
        createRecoveryPoint(data);
        saveTripData(imported);
        onDataLoaded(imported);
        setMessage("Back-up geïmporteerd. De vorige gegevens zijn als herstelpunt bewaard.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Het JSON-bestand kon niet worden gelezen.");
      }
    };
    reader.onerror = () => setMessage("Het geselecteerde bestand kon niet worden geopend.");
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm("Weet je zeker dat je alle gegevens wilt herstellen naar de standaard wereldreis instellingen?")) {
      const reset = resetTripData();
      onDataLoaded(reset);
      setMessage("Standaardgegevens hersteld. Je vorige gegevens zijn als herstelpunt bewaard.");
    }
  };

  const handleRestoreRecoveryPoint = () => {
    if (!confirm("Het laatste herstelpunt terugzetten? De huidige gegevens worden eerst opnieuw als herstelpunt bewaard.")) return;
    const restored = restoreRecoveryPoint(data);
    if (restored) {
      onDataLoaded(restored);
      setMessage("Het herstelpunt is teruggezet.");
    } else {
      setMessage("Er is geen bruikbaar herstelpunt gevonden.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#174A7E] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-[#39B8C8]" />
            <h3 className="font-bold text-base">Synchronisatie & Exporteren</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Offline Sync Status */}
          <div className="p-3.5 bg-[#F3E7C8]/40 dark:bg-slate-800/80 rounded-xl border border-[#F3E7C8] dark:border-slate-700 flex items-center gap-3">
            <HardDrive className="w-6 h-6 text-[#174A7E] dark:text-[#39B8C8] shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                Automatische Offline Back-up <Check className="w-4 h-4 text-emerald-600" />
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Lokaal opgeslagen op dit apparaat. Laatst bewaard: {storageStatus.savedAt ? new Date(storageStatus.savedAt).toLocaleString("nl-NL") : "nog niet bekend"}.
              </p>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-500">
                Opslaggrootte: {(storageStatus.sizeBytes / 1024).toFixed(1)} KB. Maak geregeld ook een JSON-back-up buiten deze browser.
              </p>
            </div>
          </div>

          {/* Export Actions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Bestanden Exporteren
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => exportToJSON(data)}
                className="flex items-center gap-2.5 p-3 bg-slate-100 dark:bg-slate-800 hover:bg-[#174A7E] hover:text-white dark:hover:bg-[#174A7E] text-slate-800 dark:text-slate-200 rounded-xl font-medium text-xs transition border border-slate-200 dark:border-slate-700"
              >
                <FileCode className="w-4 h-4 text-[#39B8C8]" />
                <div className="text-left">
                  <span className="block font-bold">JSON Volledige Back-up</span>
                  <span className="text-[10px] opacity-75">Alle reisdata downloaden</span>
                </div>
              </button>

              <button
                onClick={() => exportBudgetToCSV(data.budgetExpenses)}
                className="flex items-center gap-2.5 p-3 bg-slate-100 dark:bg-slate-800 hover:bg-[#174A7E] hover:text-white dark:hover:bg-[#174A7E] text-slate-800 dark:text-slate-200 rounded-xl font-medium text-xs transition border border-slate-200 dark:border-slate-700"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                <div className="text-left">
                  <span className="block font-bold">CSV Uitgaven</span>
                  <span className="text-[10px] opacity-75">Voor Excel / Google Sheets</span>
                </div>
              </button>

              <button
                onClick={() => exportTravelBookHTML(data)}
                className="flex items-center gap-2.5 p-3 bg-slate-100 dark:bg-slate-800 hover:bg-[#174A7E] hover:text-white dark:hover:bg-[#174A7E] text-slate-800 dark:text-slate-200 rounded-xl font-medium text-xs transition border border-slate-200 dark:border-slate-700 sm:col-span-2"
              >
                <BookOpen className="w-4 h-4 text-amber-500" />
                <div className="text-left">
                  <span className="block font-bold">HTML & PDF Reisboek</span>
                  <span className="text-[10px] opacity-75">Printsfeervolle opmaak van dagboek, route & vluchten</span>
                </div>
              </button>
            </div>
          </div>

          {message && (
            <div role="status" className="rounded-xl border border-[#39B8C8]/30 bg-[#39B8C8]/10 px-3 py-2 text-xs font-semibold text-[#174A7E] dark:text-cyan-100">
              {message}
            </div>
          )}

          {/* Import & Reset */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition"
            >
              <Upload className="w-3.5 h-3.5 text-[#174A7E] dark:text-[#39B8C8]" />
              <span>Back-up Importeren</span>
            </button>

            <button
              onClick={handleRestoreRecoveryPoint}
              disabled={!storageStatus.hasRecoveryPoint}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Herstelpunt</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold rounded-xl transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Fabrieksinstellingen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useMemo, useRef, useState } from "react";
import { Activity, AlertTriangle, Backpack, Car, CheckCircle2, FileSpreadsheet, Hotel, ListChecks, MapPinned, Plane, ShieldCheck, Upload, WalletCards, X } from "lucide-react";
import * as XLSX from "xlsx";
import { TripDataState } from "../types";
import { applyExcelImport, createExcelImportPreview, ExcelImportPreview } from "../utils/excelImport";
import { createRecoveryPoint, saveTripData } from "../utils/storage";

interface ImportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TripDataState;
  onDataLoaded: (data: TripDataState) => void;
}

export const ImportCenterModal: React.FC<ImportCenterModalProps> = ({ isOpen, onClose, data, onDataLoaded }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ExcelImportPreview | null>(null);
  const [error, setError] = useState("");
  const [replace, setReplace] = useState(true);
  const [done, setDone] = useState(false);

  const importCount = useMemo(() => preview ? preview.timeline.length + preview.accommodations.length + preview.flights.length + preview.activities.length + preview.checklists.length + preview.documents.length + preview.packingItems.length + preview.carRentals.length : 0, [preview]);
  if (!isOpen) return null;

  const readFile = async (file?: File) => {
    if (!file) return;
    setError("");
    setDone(false);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
      setPreview(createExcelImportPreview(workbook, file.name));
    } catch (cause) {
      setPreview(null);
      setError(cause instanceof Error ? cause.message : "Het Excel-bestand kon niet worden gelezen.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const applyImport = () => {
    if (!preview || !importCount) return;
    createRecoveryPoint(data);
    const imported = applyExcelImport(data, preview, replace);
    saveTripData(imported);
    onDataLoaded(imported);
    setDone(true);
  };

  const cards = preview ? [
    [MapPinned, preview.timeline.length, "reisdagen"],
    [Hotel, preview.accommodations.length, "verblijven"],
    [Plane, preview.flights.length, "vluchten"],
    [Car, preview.carRentals.length, "huurauto’s"],
    [Activity, preview.activities.length, "activiteiten"],
    [WalletCards, preview.budgetExpenses.length, "uitgaven"],
    [ListChecks, preview.checklists.length, "taken"],
    [ShieldCheck, preview.documents.length, "verzekeringen"],
    [Backpack, preview.packingItems.length, "paklijstitems"],
    [FileSpreadsheet, preview.detailSheets.length, "dagplanningen"],
  ] as const : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <header className="sticky top-0 z-10 flex items-center justify-between bg-[#174A7E] px-5 py-4 text-white">
          <div className="flex items-center gap-3"><FileSpreadsheet className="h-6 w-6 text-cyan-300"/><div><h2 className="font-black">Excel importeren</h2><p className="text-xs text-blue-100">Jouw vaste tabbladen en vrije Dagplanning-tabbladen</p></div></div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Sluiten"><X className="h-5 w-5"/></button>
        </header>

        <div className="space-y-5 p-5 sm:p-6">
          <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900 dark:bg-cyan-950/30">
            <h3 className="font-black text-slate-900 dark:text-white">Ondersteunde indeling</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300"><strong>Planning simpel</strong> vormt de globale reis. Alle tabbladen die beginnen met <strong>Dagplanning -</strong> vullen de inhoud per dag aan. Ook Budget, Paklijst, To Do, Verzekeringen, Vluchten en vervoer en Excursies en activiteiten worden verwerkt.</p>
          </section>

          <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(event) => readFile(event.target.files?.[0])}/>
          <button onClick={() => inputRef.current?.click()} className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 font-black text-[#174A7E] transition hover:border-cyan-400 hover:bg-cyan-50 dark:border-slate-700 dark:bg-slate-900 dark:text-cyan-300">
            <Upload className="h-6 w-6"/> Kies jouw Excel-bestand
          </button>

          {error && <div className="flex gap-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200"><AlertTriangle className="h-5 w-5 shrink-0"/>{error}</div>}

          {preview && <>
            <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
              <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Bestand</p><h3 className="font-black text-slate-900 dark:text-white">{preview.fileName}</h3></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{preview.sheets.length} tabbladen</span></div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {cards.map(([Icon, value, label]) => <div key={label} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-900"><Icon className="mx-auto h-5 w-5 text-cyan-600"/><strong className="mt-1 block text-xl text-slate-900 dark:text-white">{value}</strong><span className="text-[11px] text-slate-500">{label}</span></div>)}
              </div>
              {preview.detailSheets.length > 0 && <p className="mt-3 text-xs text-slate-500">Herkend: {preview.detailSheets.join(", ")}</p>}
            </section>

            {preview.warnings.length > 0 && <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">{preview.warnings.map((warning) => <p key={warning}>• {warning}</p>)}</div>}

            <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><input type="checkbox" checked={replace} onChange={(event) => setReplace(event.target.checked)} className="mt-1"/><span><strong className="block text-sm text-slate-900 dark:text-white">Bestaande reisgegevens vervangen</strong><span className="text-xs text-slate-500">Aanbevolen bij de eerste import. De app maakt vooraf automatisch een herstelpunt.</span></span></label>

            {done ? <div className="flex items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"><CheckCircle2 className="h-6 w-6"/><div><strong>Import voltooid</strong><p className="text-xs">Reisplanning, kaart, vluchten, budget, paklijst, activiteiten, verzekeringen en checklist zijn bijgewerkt.</p></div></div> : <button disabled={!importCount} onClick={applyImport} className="w-full rounded-xl bg-[#174A7E] px-4 py-3 font-black text-white hover:bg-[#123d69] disabled:cursor-not-allowed disabled:opacity-40">Importeer {importCount} onderdelen</button>}
          </>}
        </div>
      </div>
    </div>
  );
};

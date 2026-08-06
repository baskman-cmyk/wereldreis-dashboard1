import React, { useState } from "react";
import { Calendar, Check, Copy, Home, Mail, MapPin, Navigation, Phone, Wifi } from "lucide-react";
import { Accommodation } from "../types";
import { PdfAttachmentControl } from "./PdfAttachmentControl";

interface AccommodatiesViewProps {
  accommodations: Accommodation[];
  onUpdateAccommodation: (accommodation: Accommodation) => void;
}

export const AccommodatiesView: React.FC<AccommodatiesViewProps> = ({
  accommodations,
  onUpdateAccommodation,
}) => {
  const [copiedWifiId, setCopiedWifiId] = useState<string | null>(null);

  const handleCopyWifi = async (acc: Accommodation) => {
    if (!acc.wifiCode) return;
    await navigator.clipboard.writeText(acc.wifiCode);
    setCopiedWifiId(acc.id);
    window.setTimeout(() => setCopiedWifiId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
            <Home className="h-5 w-5 text-[#39B8C8]" /> Accommodaties & Verblijven
          </h2>
          <p className="mt-1 text-xs text-slate-500">Boekingsgegevens, wifi, contactinformatie en reserverings-PDF's.</p>
        </div>
        <span className="rounded-full bg-[#174A7E] px-3 py-1 text-xs font-bold text-[#39B8C8]">{accommodations.length} verblijven</span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {accommodations.map((acc) => (
          <article key={acc.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {acc.foto && (
              <div className="relative h-44 w-full">
                <img src={acc.foto} alt={acc.name} className="h-full w-full object-cover" />
                <span className="absolute right-3 top-3 rounded-full bg-[#174A7E] px-3 py-1 text-xs font-bold text-white">€{acc.prijsEur || 0}</span>
              </div>
            )}

            <div className="space-y-4 p-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{acc.name}</h3>
                <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-500"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#39B8C8]" />{acc.adres || "Adres nog niet ingevuld"}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800"><span className="block text-[10px] font-bold text-slate-400">Inchecken</span><strong>{acc.checkIn || "—"}</strong></div>
                <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800"><span className="block text-[10px] font-bold text-slate-400">Uitchecken</span><strong>{acc.checkOut || "—"}</strong></div>
              </div>

              {acc.wifiCode && (
                <div className="flex items-center justify-between rounded-2xl border border-[#F3E7C8] bg-[#F3E7C8]/50 p-3.5 dark:border-slate-700 dark:bg-slate-800">
                  <div className="flex items-center gap-2"><Wifi className="h-4 w-4 text-[#174A7E]" /><div><span className="block text-[10px] font-bold uppercase text-slate-400">Wifi</span><span className="font-mono text-xs font-bold">{acc.wifiCode}</span></div></div>
                  <button onClick={() => void handleCopyWifi(acc)} className="flex items-center gap-1 rounded-xl bg-[#174A7E] px-3 py-1.5 text-xs font-bold text-white">
                    {copiedWifiId === acc.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedWifiId === acc.id ? "Gekopieerd" : "Kopieer"}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                {acc.telefoon && <a href={`tel:${acc.telefoon}`} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800"><Phone className="h-3.5 w-3.5 text-[#39B8C8]" />{acc.telefoon}</a>}
                {acc.email && <a href={`mailto:${acc.email}`} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800"><Mail className="h-3.5 w-3.5 text-[#39B8C8]" /><span className="truncate">{acc.email}</span></a>}
                {acc.mapsUrl && <a href={acc.mapsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800"><Navigation className="h-3.5 w-3.5 text-[#39B8C8]" />Open in Maps</a>}
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800"><Calendar className="h-3.5 w-3.5 text-[#39B8C8]" />Boeking: {acc.boekingsnummer || "—"}</div>
              </div>

              {acc.bijzonderheden && <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{acc.bijzonderheden}</p>}

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">Boekingsbevestiging</p>
                <PdfAttachmentControl
                  attachment={acc.bookingPdf}
                  label="Reserverings-PDF uploaden"
                  onChange={(bookingPdf) => onUpdateAccommodation({ ...acc, bookingPdf })}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

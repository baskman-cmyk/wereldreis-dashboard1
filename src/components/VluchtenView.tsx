import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, Plane, QrCode, X } from "lucide-react";
import { Flight } from "../types";
import { PdfAttachmentControl } from "./PdfAttachmentControl";

interface VluchtenViewProps {
  flights: Flight[];
  onUpdateFlight: (flight: Flight) => void;
}

export const VluchtenView: React.FC<VluchtenViewProps> = ({ flights, onUpdateFlight }) => {
  const [selectedQrFlight, setSelectedQrFlight] = useState<Flight | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-slate-900 dark:text-white"><Plane className="h-5 w-5 text-[#39B8C8]" /> Vluchten & E-tickets</h2>
          <p className="mt-1 text-xs text-slate-500">Bewaar per vlucht de boardinggegevens en de originele boekings-PDF.</p>
        </div>
        <span className="rounded-full bg-[#174A7E] px-3 py-1 text-xs font-bold text-[#39B8C8]">{flights.length} vluchten</span>
      </div>

      <div className="space-y-4">
        {flights.map((flight) => (
          <article key={flight.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-[#39B8C8]">{flight.airline}</p>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{flight.flightNumber}</h3>
                <p className="text-xs text-slate-500">{flight.departureDate}</p>
              </div>
              <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${flight.status === "Op tijd" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" : "bg-amber-50 text-amber-700"}`}>
                {flight.status === "Op tijd" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}{flight.status}
              </span>
            </div>

            <div className="mb-4 grid grid-cols-3 items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/60">
              <div><p className="text-2xl font-black">{flight.fromCode}</p><p className="text-xs text-slate-500">{flight.fromCity}</p><p className="mt-1 text-xs font-bold text-[#174A7E] dark:text-[#39B8C8]">{flight.departureTime}</p></div>
              <div className="flex flex-col items-center"><Plane className="h-5 w-5 rotate-90 text-[#39B8C8]" /><div className="my-1 h-0.5 w-full bg-[#39B8C8]/40" /><span className="text-[10px] text-slate-400">{flight.terminal || "Terminal —"}</span></div>
              <div><p className="text-2xl font-black">{flight.toCode}</p><p className="text-xs text-slate-500">{flight.toCity}</p><p className="mt-1 text-xs font-bold text-[#174A7E] dark:text-[#39B8C8]">{flight.arrivalTime}</p></div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
              <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800"><span className="block text-[10px] font-bold text-slate-400">Gate</span><strong>{flight.gate || "—"}</strong></div>
              <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800"><span className="block text-[10px] font-bold text-slate-400">Stoelen</span><strong>{flight.seat || "—"}</strong></div>
              <div className="col-span-2 rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800"><span className="block text-[10px] font-bold text-slate-400">Bagage</span><strong>{flight.baggage || "—"}</strong></div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[auto_1fr] lg:items-start">
              <button onClick={() => setSelectedQrFlight(flight)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#174A7E] px-4 py-2.5 text-xs font-bold text-white"><QrCode className="h-4 w-4 text-[#39B8C8]" /> Boardingpass QR</button>
              <PdfAttachmentControl attachment={flight.eTicketPdf} label="E-ticket PDF uploaden" onChange={(eTicketPdf) => onUpdateFlight({ ...flight, eTicketPdf })} compact />
            </div>
          </article>
        ))}
      </div>

      {selectedQrFlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between"><h3 className="font-black">Boardingpass</h3><button onClick={() => setSelectedQrFlight(null)}><X className="h-5 w-5" /></button></div>
            <div className="mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-2xl border-8 border-slate-900 bg-white font-mono text-xs font-black text-slate-900">QR<br />{selectedQrFlight.qrCodeText || selectedQrFlight.flightNumber}</div>
            <p className="text-xs font-bold text-slate-500">{selectedQrFlight.airline} {selectedQrFlight.flightNumber} · {selectedQrFlight.seat || "Stoel nog onbekend"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

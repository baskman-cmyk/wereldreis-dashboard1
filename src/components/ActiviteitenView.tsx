import React from "react";
import { ExternalLink, HeartHandshake, MapPin, Ticket } from "lucide-react";
import { ActivityItem } from "../types";
import { PdfAttachmentControl } from "./PdfAttachmentControl";

interface ActiviteitenViewProps {
  activities: ActivityItem[];
  onUpdateActivity: (activity: ActivityItem) => void;
}

export const ActiviteitenView: React.FC<ActiviteitenViewProps> = ({ activities, onUpdateActivity }) => (
  <div className="space-y-6 animate-in fade-in duration-200">
    <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div><h2 className="flex items-center gap-2 text-xl font-bold"><Ticket className="h-5 w-5 text-[#39B8C8]" /> Activiteiten, Excursies & Entreetickets</h2><p className="mt-1 text-xs text-slate-500">Bewaar tickets, reserveringen en bevestigings-PDF's bij de activiteit.</p></div>
      <span className="rounded-full bg-[#174A7E] px-3 py-1 text-xs font-bold text-[#39B8C8]">{activities.length} activiteiten</span>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {activities.map((act) => (
        <article key={act.id} className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div>
            {act.photos?.[0] && <img src={act.photos[0]} alt={act.name} className="h-44 w-full object-cover" />}
            <div className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-3"><h3 className="font-black">{act.name}</h3><span className="shrink-0 rounded-full bg-[#174A7E] px-2.5 py-1 text-[10px] font-bold text-white">€{act.priceEur || 0}</span></div>
              <p className="flex items-start gap-1.5 text-xs text-slate-500"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#39B8C8]" />{act.location}</p>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{act.description}</p>
              <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"><span className="flex items-center gap-1"><HeartHandshake className="h-4 w-4" /> Kindvriendelijk</span><span>{"★".repeat(Math.max(0, Math.min(5, act.kidFriendlyScore || 0)))}</span></div>
              {act.bookingRef && <p className="text-xs"><strong>Boekingsnummer:</strong> {act.bookingRef}</p>}
              <PdfAttachmentControl attachment={act.ticketPdf} label="Ticket-PDF uploaden" onChange={(ticketPdf) => onUpdateActivity({ ...act, ticketPdf })} />
            </div>
          </div>
          {act.ticketsUrl && <div className="border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50"><a href={act.ticketsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-[#174A7E] px-3 py-2 text-xs font-bold text-white"><ExternalLink className="h-3.5 w-3.5 text-[#39B8C8]" /> Website / e-ticket</a></div>}
        </article>
      ))}
    </div>
  </div>
);

import React from "react";
import { ShieldAlert, PhoneCall } from "lucide-react";
import { EmergencyCountry } from "../types";

interface NoodViewProps {
  emergencyContacts: EmergencyCountry[];
}

export const NoodView: React.FC<NoodViewProps> = ({ emergencyContacts }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Emergency Alert Banner */}
      <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white p-6 rounded-3xl shadow-xl border border-rose-500/40">
        <div className="flex items-center gap-3 mb-2">
          <ShieldAlert className="w-8 h-8 text-amber-300" />
          <h2 className="text-2xl font-black">Noodinformatie & Alarmnummers</h2>
        </div>
        <p className="text-xs text-rose-100 max-w-xl">
          Directe alarmnummers per land, contactgegevens van de Nederlandse Ambassade en 24/7 reisverzekering alarmcentrale.
        </p>
      </div>

      {/* Emergency Contacts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {emergencyContacts.map((contact, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                <span className="text-2xl">{contact.flag}</span>
                <span className="font-black text-slate-900 dark:text-white text-base">
                  {contact.land}
                </span>
              </div>

              {/* Police & Ambulance */}
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900 mb-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 block">
                    Alarmnummer (Politie/Ambulance)
                  </span>
                  <span className="text-2xl font-black text-rose-900 dark:text-rose-100 font-mono">
                    {contact.alarmnummer}
                  </span>
                </div>
                <a
                  href={`tel:${contact.alarmnummer}`}
                  className="p-3 bg-rose-600 text-white rounded-xl shadow-md hover:bg-rose-700"
                >
                  <PhoneCall className="w-5 h-5" />
                </a>
              </div>

              {/* Embassy & Insurance */}
              <div className="text-xs space-y-2 text-slate-700 dark:text-slate-300">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 font-bold block text-[10px]">Nederlandse Ambassade</span>
                  <strong className="block text-slate-900 dark:text-white mt-0.5">{contact.embassy.name}</strong>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{contact.embassy.phone}</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-slate-400 font-bold block text-[10px]">Reisverzekering Alarmcentrale Hotline</span>
                  <strong className="block text-slate-900 dark:text-white mt-0.5">{contact.verzekeraarHotline}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

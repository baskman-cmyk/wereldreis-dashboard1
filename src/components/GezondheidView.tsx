import React, { useState } from "react";
import {
  HeartPulse,
  Pill,
  ShieldAlert,
  Phone,
  Check,
  AlertTriangle,
  UserCheck,
  Clock,
} from "lucide-react";
import { FamilyMember } from "../types";

interface GezondheidViewProps {
  familyMembers: FamilyMember[];
  onUpdateFamilyMember: (updated: FamilyMember) => void;
}

export const GezondheidView: React.FC<GezondheidViewProps> = ({
  familyMembers,
  onUpdateFamilyMember,
}) => {
  const membersList = familyMembers && familyMembers.length > 0 ? familyMembers : [];
  const [selectedMemberId, setSelectedMemberId] = useState<string>(
    membersList[2]?.id || membersList[0]?.id || ""
  );

  const currentMember =
    membersList.find((m) => m.id === selectedMemberId) || membersList[0];

  const handleToggleMedReminder = (medIndex: number) => {
    const updatedMeds = [...currentMember.medicijnen];
    updatedMeds[medIndex].takenToday = !updatedMeds[medIndex].takenToday;
    onUpdateFamilyMember({ ...currentMember, medicijnen: updatedMeds });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            Gezondheid, Medicijnen & EHBO
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Volledig medisch dossier per gezinslid met dagelijkse medicijnherinneringen en allergie-alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-full border border-rose-500/20">
            Medische Gegevens Vertrouwelijk
          </span>
        </div>
      </div>

      {/* Family Member Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {familyMembers.map((member) => {
          const isSelected = member.id === selectedMemberId;
          const allMedsTaken = member.medicijnen.every((m) => m.takenToday);

          return (
            <button
              key={member.id}
              onClick={() => setSelectedMemberId(member.id)}
              className={`p-4 rounded-3xl border text-left transition ${
                isSelected
                  ? "bg-[#174A7E] text-white shadow-md border-[#39B8C8]"
                  : "bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-base">{member.naam}</span>
                <span className="text-xs opacity-75">{member.leeftijd} jr</span>
              </div>
              <p className="text-xs opacity-80">Rol: {member.rol}</p>

              {member.medicijnen.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold">
                  {allMedsTaken ? (
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3" /> Meds Genomen
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Meds Openstaand
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Member Details */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Medisch Dossier: {currentMember.naam} ({currentMember.rol})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Polisnummer: {currentMember.verzekeringsPolis} • Dichtstbijzijnde Ziekenhuis: {currentMember.nabijZiekenhuis}
            </p>
          </div>
        </div>

        {/* Medication Daily Checkers */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Pill className="w-4 h-4 text-[#39B8C8]" />
            Dagelijkse Medicijnen & Herinneringen
          </h4>

          {currentMember.medicijnen.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Geen dagelijkse medicatie geregistreerd.</p>
          ) : (
            <div className="space-y-2.5">
              {currentMember.medicijnen.map((med, idx) => (
                <div
                  key={idx}
                  onClick={() => handleToggleMedReminder(idx)}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    med.takenToday
                      ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white"
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        med.takenToday
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm">{med.medicationName}</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Dosering: <strong>{med.dosage}</strong> ({med.timeOfDay}) • Voorraad:{" "}
                        <strong>{med.stockCount} stuks over</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {med.takenToday ? (
                      <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-2xs">
                        <Check className="w-4 h-4" /> Genomen
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-[#174A7E] text-white font-bold text-xs rounded-xl hover:bg-[#1d5c9c]">
                        Vink af als genomen
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Allergies & Vaccinations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Allergies */}
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Allergieën & Intoleranties
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {currentMember.allergieen.map((a, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 font-bold text-xs rounded-lg"
                >
                  ⚠️ {a}
                </span>
              ))}
            </div>
          </div>

          {/* Vaccinations */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" /> Vaccinaties & Gele Boekje
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {currentMember.vaccinaties.map((v, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 font-bold text-xs rounded-lg"
                >
                  ✓ {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

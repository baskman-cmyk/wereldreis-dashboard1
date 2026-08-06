import React, { useState } from "react";
import {
  Truck,
  Car,
  Plus,
  Fuel,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Gauge,
  Droplets,
  Zap,
  Scale,
  ShieldCheck,
  Check,
  X,
  CreditCard,
  MapPin,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Info,
} from "lucide-react";
import { PdfAttachmentControl } from "./PdfAttachmentControl";
import { CamperDetails, CarRentalDetails } from "../types";

interface CamperViewProps {
  camper: CamperDetails;
  onUpdateCamper: (camper: CamperDetails) => void;
}

export const CamperView: React.FC<CamperViewProps> = ({
  camper,
  onUpdateCamper,
}) => {
  const [activeMode, setActiveMode] = useState<"camper" | "auto" | "vergelijking">(
    camper.activeOption || "camper"
  );

  const [activeSubTab, setActiveSubTab] = useState<
    "overzicht" | "tankbeurten" | "inventaris" | "campings" | "onderhoud"
  >("overzicht");

  // Fuel form state
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [fuelKm, setFuelKm] = useState("");
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");
  const [fuelLoc, setFuelLoc] = useState("");

  const blankCar: CarRentalDetails = {
    modelName: "Nog invullen",
    category: "Huurauto",
    company: "Nog invullen",
    ophaallocatie: "",
    inleverlocatie: "",
    ophaaldatum: "",
    inleverdatum: "",
    dagprijsEur: 0,
    brandstofverbruikLPer100Km: 0,
    verzekeringInfo: "",
    tolpasInbegrepen: false,
    kinderzitjesInbegrepen: false,
    hotelBudgetPerNachtEur: 0,
  };
  const rentals = camper.carRentals?.length ? camper.carRentals : (camper.carOption ? [camper.carOption] : []);
  const car = rentals[0] || blankCar;

  const handleAddFuel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fuelLiters || !fuelPrice) return;
    const newRefill = {
      id: "refill-" + Date.now(),
      date: new Date().toLocaleDateString("nl-NL"),
      km: parseInt(fuelKm) || camper.kilometerstand + 450,
      liters: parseFloat(fuelLiters),
      priceEur: parseFloat(fuelPrice),
      location: fuelLoc || "Tankstation",
    };
    onUpdateCamper({
      ...camper,
      kilometerstand: newRefill.km,
      tankbeurten: [newRefill, ...camper.tankbeurten],
    });
    setFuelKm("");
    setFuelLiters("");
    setFuelPrice("");
    setFuelLoc("");
    setShowFuelForm(false);
  };

  const handleToggleInventory = (invId: string) => {
    const updatedInventory = camper.inventaris.map((item) =>
      item.id === invId
        ? {
            ...item,
            status: item.status === "ok" ? ("missing" as const) : ("ok" as const),
          }
        : item
    );
    onUpdateCamper({ ...camper, inventaris: updatedInventory });
  };

  const setPrimaryTransport = (mode: "camper" | "auto") => {
    setActiveMode(mode);
    onUpdateCamper({
      ...camper,
      activeOption: mode,
    });
  };

  // Calculations for comparison matrix
  const daysRoadtrip = 30; // 30 days roadtrip segment (e.g. Australia / USA)
  const totalKm = 4800; // estimated km segment
  const fuelPricePerLiterEur = 1.25;

  const camperRentalTotal = 145 * daysRoadtrip; // €4,350
  const camperStayTotal = 55 * daysRoadtrip; // €1,650 campgrounds
  const camperFuelTotal = (totalKm / 100) * camper.brandstofverbruikLPer100Km * fuelPricePerLiterEur; // ~ €684
  const camperGrandTotal = camperRentalTotal + camperStayTotal + camperFuelTotal;

  const carRentalTotal = car.dagprijsEur * daysRoadtrip; // €2,250
  const carStayTotal = car.hotelBudgetPerNachtEur * daysRoadtrip; // €4,800 hotels
  const carFuelTotal = (totalKm / 100) * car.brandstofverbruikLPer100Km * fuelPricePerLiterEur; // ~ €492
  const carGrandTotal = carRentalTotal + carStayTotal + carFuelTotal;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Mode Switcher */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#39B8C8]/20 text-[#174A7E] dark:text-[#39B8C8] text-[11px] font-bold uppercase tracking-wider rounded-lg">
                Vervoer & Voertuig Opties
              </span>
              <span className="text-xs font-semibold text-slate-400">•</span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Gekozen Hoofdmodus:{" "}
                <span className="text-[#174A7E] dark:text-[#39B8C8] font-black uppercase">
                  {camper.activeOption === "auto" ? "🚗 Huurauto + Hotels" : "🚐 Camper Motorhome"}
                </span>
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 mt-1">
              {activeMode === "auto" ? (
                <>
                  <Car className="w-6 h-6 text-[#174A7E] dark:text-[#39B8C8]" />
                  Huurauto Fleet Beheer
                </>
              ) : activeMode === "vergelijking" ? (
                <>
                  <Scale className="w-6 h-6 text-amber-500" />
                  Vergelijking: Camper vs. Huurauto
                </>
              ) : (
                <>
                  <Truck className="w-6 h-6 text-[#39B8C8]" />
                  Camper Fleet Beheer
                </>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Wissel eenvoudig tussen de Camper (Motorhome) en Huurauto (Car + Hotels) of vergelijk de totale kosten.
            </p>
          </div>

          {/* Primary Action Buttons / Mode Selector */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveMode("camper")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeMode === "camper"
                  ? "bg-[#174A7E] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Truck className="w-4 h-4 text-[#39B8C8]" />
              <span>🚐 Camper Modus</span>
            </button>

            <button
              onClick={() => setActiveMode("auto")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeMode === "auto"
                  ? "bg-[#174A7E] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Car className="w-4 h-4 text-[#39B8C8]" />
              <span>🚗 Huurauto Modus</span>
            </button>

            <button
              onClick={() => setActiveMode("vergelijking")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeMode === "vergelijking"
                  ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>📊 Vergelijking</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 1. CAMPER MODE CONTENT */}
      {/* ==================================================================== */}
      {activeMode === "camper" && (
        <>
          {/* Tank Levels Live Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" /> Gasfles Niveau
                </span>
                <span className="text-sm font-black text-amber-500">
                  {camper.tankLevels.gasPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${camper.tankLevels.gasPercent}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-[#39B8C8]" /> Schoonwatertank
                </span>
                <span className="text-sm font-black text-[#39B8C8]">
                  {camper.tankLevels.waterPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#39B8C8] h-full rounded-full"
                  style={{ width: `${camper.tankLevels.waterPercent}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-slate-400" /> Afvalwatertank (Grey Water)
                </span>
                <span className="text-sm font-black text-slate-600 dark:text-slate-300">
                  {camper.tankLevels.afvalwaterPercent}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-slate-500 h-full rounded-full"
                  style={{ width: `${camper.tankLevels.afvalwaterPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Sub Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
            {[
              { id: "overzicht", label: "Overzicht & Huurcontract" },
              { id: "tankbeurten", label: "Brandstof & Tankbeurten" },
              { id: "inventaris", label: "Inventarislijst" },
              { id: "campings", label: "Geboekte Campings" },
              { id: "onderhoud", label: "Onderhoud & Schades" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 ${
                  activeSubTab === tab.id
                    ? "bg-[#174A7E] text-white shadow-md"
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overzicht Subtab */}
          {activeSubTab === "overzicht" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {camper.modelName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    4-persoons Motorhome met keuken, douche, toilet en 2x tweepersoonsbed.
                  </p>
                </div>
                <span className="px-3 py-1 bg-[#174A7E] text-white font-mono text-xs font-bold rounded-xl border border-[#39B8C8]">
                  Kenteken: {camper.licensePlate}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 font-bold block text-[10px]">Kilometerstand</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                    {camper.kilometerstand.toLocaleString()} km
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 font-bold block text-[10px]">Gem. Verbruik</span>
                  <span className="text-xl font-black text-[#174A7E] dark:text-[#39B8C8] mt-1 block">
                    {camper.brandstofverbruikLPer100Km} L / 100km
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 font-bold block text-[10px]">Ophaallocatie</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                    {camper.ophaallocatie} ({camper.ophaaldatum})
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-400 font-bold block text-[10px]">Inleverlocatie</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white mt-1 block">
                    {camper.inleverlocatie} ({camper.inleverdatum})
                  </span>
                </div>
              </div>

              <div className="p-4 bg-[#F3E7C8]/40 dark:bg-slate-800/50 rounded-2xl border border-[#F3E7C8] dark:border-slate-700">
                <span className="text-xs font-bold text-[#174A7E] dark:text-[#39B8C8] block mb-1">
                  🛡️ Verzekering & Breakdown Service
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {camper.verzekeringInfo}
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setPrimaryTransport("camper")}
                  className="px-4 py-2 bg-[#174A7E] text-white font-bold text-xs rounded-xl shadow-xs hover:bg-[#1d5c9c]"
                >
                  ✓ Stel in als Actief Hoofdvervoer
                </button>
              </div>
            </div>
          )}

          {/* Tankbeurten Subtab */}
          {activeSubTab === "tankbeurten" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowFuelForm(!showFuelForm)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#174A7E] text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  <Plus className="w-4 h-4 text-[#39B8C8]" /> Tankbeurt Registreren
                </button>
              </div>

              {showFuelForm && (
                <form
                  onSubmit={handleAddFuel}
                  className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md grid grid-cols-1 sm:grid-cols-4 gap-3 animate-in zoom-in-95 duration-150"
                >
                  <input
                    type="number"
                    placeholder="KM Stand *"
                    value={fuelKm}
                    onChange={(e) => setFuelKm(e.target.value)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700"
                    required
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Liters (bijv. 65.4) *"
                    value={fuelLiters}
                    onChange={(e) => setFuelLiters(e.target.value)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700"
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Prijs in EUR (€) *"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(e.target.value)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Locatie (bijv. Shell Sydney)"
                    value={fuelLoc}
                    onChange={(e) => setFuelLoc(e.target.value)}
                    className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700"
                  />
                  <button
                    type="submit"
                    className="sm:col-span-4 py-2 bg-[#39B8C8] text-[#174A7E] font-bold text-xs rounded-xl"
                  >
                    Opslaan
                  </button>
                </form>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3">
                  Historie Tankbeurten ({camper.tankbeurten.length})
                </h4>
                <div className="space-y-2">
                  {camper.tankbeurten.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {t.location}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {t.date} • {t.km} km
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-[#174A7E] dark:text-[#39B8C8] text-sm block">
                          €{t.priceEur.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500">{t.liters} L</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Inventaris Subtab */}
          {activeSubTab === "inventaris" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Camper Inventaris & Uitrusting
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {camper.inventaris.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleInventory(item.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                      item.status === "ok"
                        ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white"
                        : "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-slate-900 dark:text-white"
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs block">{item.item}</span>
                      <span className="text-[10px] text-slate-400">
                        Aantal: {item.quantity} • {item.category}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        item.status === "ok"
                          ? "bg-emerald-500 text-white"
                          : "bg-rose-500 text-white"
                      }`}
                    >
                      {item.status === "ok" ? "Aanwezig" : "Mist / Defect"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Campings Subtab */}
          {activeSubTab === "campings" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {camper.campings.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#39B8C8] uppercase">
                      {c.date}
                    </span>
                    <span className="px-2 py-0.5 bg-[#F3E7C8] text-[#174A7E] font-bold text-[10px] rounded-md">
                      ★ {c.rating}/5
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {c.name}
                  </h4>
                  <p className="text-xs text-slate-500">{c.address}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      €{c.priceEur} / nacht
                    </span>
                    <span className="text-slate-400">WiFi: {c.wifi}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Onderhoud Subtab */}
          {activeSubTab === "onderhoud" && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Onderhoudsbeurten & Schade Logboek
              </h4>
              <div className="space-y-3">
                {camper.onderhoud.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {m.type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {m.date} • {m.notes}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {m.status} (€{m.costEur})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ==================================================================== */}
      {/* 2. CAR MODE CONTENT */}
      {/* ==================================================================== */}
      {activeMode === "auto" && (
        <div className="space-y-5">
          {!rentals.length ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <Car className="mx-auto h-8 w-8 text-slate-300" />
              <h3 className="mt-3 font-black text-slate-900 dark:text-white">Geen huurauto’s geïmporteerd</h3>
              <p className="mt-1 text-xs text-slate-500">Importeer opnieuw het tabblad ‘Vluchten en vervoer’ met bestaande gegevens vervangen.</p>
            </div>
          ) : rentals.map((rental, index) => (
            <div key={`${rental.ophaaldatum}-${rental.ophaallocatie}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#39B8C8]">Huurauto {index + 1}</span>
                  <h3 className="mt-1 text-lg font-black text-slate-900 dark:text-white">{rental.modelName || "Huurauto"}</h3>
                  <p className="text-xs text-slate-500">{rental.company || "Verhuurder nog invullen"}</p>
                </div>
                <span className="rounded-xl bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">€{rental.dagprijsEur.toLocaleString("nl-NL")}</span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                  <p className="text-[10px] font-black uppercase text-slate-400">Ophalen</p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{rental.ophaallocatie || "Nog invullen"}</p>
                  <p className="text-xs text-slate-500">{rental.ophaaldatum || "Datum onbekend"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                  <p className="text-[10px] font-black uppercase text-slate-400">Inleveren</p>
                  <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{rental.inleverlocatie || "Nog invullen"}</p>
                  <p className="text-xs text-slate-500">{rental.inleverdatum || "Datum onbekend"}</p>
                </div>
              </div>

              {rental.verzekeringInfo && <div className="mt-4 rounded-2xl border border-[#F3E7C8] bg-[#F3E7C8]/35 p-4 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"><strong className="block text-[#174A7E] dark:text-[#39B8C8]">Reservering / verzekering</strong>{rental.verzekeringInfo}</div>}

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <PdfAttachmentControl
                  attachment={rental.rentalContractPdf}
                  label="Huurcontract PDF uploaden"
                  onChange={(rentalContractPdf) => {
                    const updated = rentals.map((item, rentalIndex) => rentalIndex === index ? { ...item, rentalContractPdf } : item);
                    onUpdateCamper({ ...camper, carOption: updated[0] || blankCar, carRentals: updated });
                  }}
                />
                <PdfAttachmentControl
                  attachment={rental.insurancePdf}
                  label="Verzekerings-PDF uploaden"
                  onChange={(insurancePdf) => {
                    const updated = rentals.map((item, rentalIndex) => rentalIndex === index ? { ...item, insurancePdf } : item);
                    onUpdateCamper({ ...camper, carOption: updated[0] || blankCar, carRentals: updated });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. COMPARISON MODE CONTENT */}
      {/* ==================================================================== */}
      {activeMode === "vergelijking" && (
        <div className="space-y-6">
          {/* Top Callout */}
          <div className="p-5 bg-gradient-to-r from-[#174A7E]/10 to-[#39B8C8]/10 dark:from-[#174A7E]/20 dark:to-[#39B8C8]/20 rounded-3xl border border-[#39B8C8]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-[#39B8C8] shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Camper vs. Huurauto Kosten & Ervaring Analyse
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Berekend op basis van een roadtrip segment van {daysRoadtrip} dagen (~{totalKm.toLocaleString()} km) voor een gezin van 4.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-[#174A7E] text-white text-xs font-bold rounded-xl shadow-xs">
                Besparing met Camper: ~€{Math.round(carGrandTotal - camperGrandTotal)}
              </span>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Camper Option Card */}
            <div
              className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 transition shadow-xs flex flex-col justify-between ${
                camper.activeOption === "camper"
                  ? "border-[#39B8C8] ring-2 ring-[#39B8C8]/20"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Truck className="w-6 h-6 text-[#39B8C8]" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        Optie A: 🚐 Camper / Motorhome
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Rijdend huisje met eigen keuken & bedden
                      </span>
                    </div>
                  </div>
                  {camper.activeOption === "camper" && (
                    <span className="px-2.5 py-1 bg-emerald-500 text-white font-bold text-[10px] rounded-full uppercase tracking-wider">
                      Actief Gekozen
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs mb-6">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Dagelijkse Huurprijs:</span>
                    <strong className="text-slate-900 dark:text-white">€145 / dag</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Overnachting (Campings):</span>
                    <strong className="text-slate-900 dark:text-white">€55 / nacht</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Brandstofverbruik (11.4L/100km):</span>
                    <strong className="text-amber-600 dark:text-amber-400">€{Math.round(camperFuelTotal)} ({totalKm} km)</strong>
                  </div>
                  <div className="flex justify-between py-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl font-black text-sm">
                    <span className="text-[#174A7E] dark:text-[#39B8C8]">Totaal Geschat ({daysRoadtrip} dgn):</span>
                    <span className="text-[#174A7E] dark:text-[#39B8C8]">€{Math.round(camperGrandTotal)}</span>
                  </div>
                </div>

                {/* Pros & Cons */}
                <div className="space-y-3 text-xs">
                  <h5 className="font-bold text-slate-900 dark:text-white">Voordelen & Ervaring:</h5>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Slaap midden in Nationale Parken & bij de natuur.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Kook eigen maaltijden (bespaar op restaurants).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Geen koffers in- en uitpakken bij elke tussenstop.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setPrimaryTransport("camper")}
                className="mt-6 w-full py-2.5 bg-[#174A7E] text-white font-bold text-xs rounded-2xl hover:bg-[#1d5c9c] transition shadow-xs"
              >
                Kies Camper als Hoofdmodus
              </button>
            </div>

            {/* Car Option Card */}
            <div
              className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 transition shadow-xs flex flex-col justify-between ${
                camper.activeOption === "auto"
                  ? "border-[#39B8C8] ring-2 ring-[#39B8C8]/20"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Car className="w-6 h-6 text-[#174A7E] dark:text-[#39B8C8]" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        Optie B: 🚗 Huurauto + Hotels
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Luxe SUV 4WD met hotel/Airbnb verblijven
                      </span>
                    </div>
                  </div>
                  {camper.activeOption === "auto" && (
                    <span className="px-2.5 py-1 bg-emerald-500 text-white font-bold text-[10px] rounded-full uppercase tracking-wider">
                      Actief Gekozen
                    </span>
                  )}
                </div>

                <div className="space-y-3 text-xs mb-6">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Dagelijkse Autohuur:</span>
                    <strong className="text-slate-900 dark:text-white">€{car.dagprijsEur} / dag</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Overnachting (Hotels/Airbnbs):</span>
                    <strong className="text-slate-900 dark:text-white">€{car.hotelBudgetPerNachtEur} / nacht</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Brandstofverbruik (8.2L/100km):</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">€{Math.round(carFuelTotal)} ({totalKm} km)</strong>
                  </div>
                  <div className="flex justify-between py-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl font-black text-sm">
                    <span className="text-[#174A7E] dark:text-[#39B8C8]">Totaal Geschat ({daysRoadtrip} dgn):</span>
                    <span className="text-[#174A7E] dark:text-[#39B8C8]">€{Math.round(carGrandTotal)}</span>
                  </div>
                </div>

                {/* Pros & Cons */}
                <div className="space-y-3 text-xs">
                  <h5 className="font-bold text-slate-900 dark:text-white">Voordelen & Ervaring:</h5>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Makkelijk wendbaar in drukke steden & parkeergarages.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Comfortabele hotelbedden & zwembaden.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Minder brandstofverbruik per kilometer.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setPrimaryTransport("auto")}
                className="mt-6 w-full py-2.5 bg-[#174A7E] text-white font-bold text-xs rounded-2xl hover:bg-[#1d5c9c] transition shadow-xs"
              >
                Kies Huurauto als Hoofdmodus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

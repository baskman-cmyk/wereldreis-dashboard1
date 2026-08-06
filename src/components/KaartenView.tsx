import React, { useMemo, useState } from "react";
import {
  BedDouble,
  ChevronRight,
  Download,
  ExternalLink,
  Flag,
  Map,
  MapPin,
  Mountain,
  Navigation,
  Route,
  Search,
  Star,
} from "lucide-react";
import {
  Accommodation,
  CountryPlan,
  HikeRoute,
  SavedLocation,
  TabType,
  TimelineDay,
} from "../types";
import { exportHikeToGPX } from "../utils/storage";

interface KaartenViewProps {
  hikes: HikeRoute[];
  timeline: TimelineDay[];
  countryPlans: CountryPlan[];
  savedLocations: SavedLocation[];
  accommodations: Accommodation[];
  onNavigate?: (tab: TabType) => void;
}

type LayerKey = "route" | "stays" | "saved" | "hikes";

const dateOnly = (value: string) => value?.slice(0, 10) || "";

const openDirections = (lat: number, lng: number) => {
  window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank", "noopener,noreferrer");
};

export const KaartenView: React.FC<KaartenViewProps> = ({
  hikes = [],
  timeline = [],
  countryPlans = [],
  savedLocations = [],
  accommodations = [],
  onNavigate,
}) => {
  const orderedTimeline = useMemo(
    () => [...timeline].sort((a, b) => dateOnly(a.date).localeCompare(dateOnly(b.date))),
    [timeline],
  );

  const countries = useMemo(
    () => countryPlans.map((country) => country.land),
    [countryPlans],
  );

  const [selectedCountry, setSelectedCountry] = useState(countries[0] || "Alle landen");
  const [query, setQuery] = useState("");
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    route: true,
    stays: true,
    saved: true,
    hikes: true,
  });
  const [selectedDayId, setSelectedDayId] = useState<string | null>(orderedTimeline[0]?.id || null);
  const [selectedHikeId, setSelectedHikeId] = useState<string | null>(hikes[0]?.id || null);

  const countryTimeline = useMemo(
    () =>
      orderedTimeline.filter(
        (day) => selectedCountry === "Alle landen" || day.land === selectedCountry,
      ),
    [orderedTimeline, selectedCountry],
  );

  const matchingSavedLocations = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return savedLocations.filter((location) => {
      const matchesQuery =
        !needle ||
        `${location.naam} ${location.adres} ${location.notities} ${location.category}`
          .toLowerCase()
          .includes(needle);
      if (!matchesQuery) return false;
      if (selectedCountry === "Alle landen") return true;
      const countryPlaces = new Set<string>(countryTimeline.map((day) => day.plaats.toLowerCase()));
      const haystack = `${location.adres} ${location.notities}`.toLowerCase();
      return [...countryPlaces].some((place) => haystack.includes(place));
    });
  }, [savedLocations, query, selectedCountry, countryTimeline]);

  const matchingAccommodations = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return accommodations.filter((stay) => {
      const countryMatch = selectedCountry === "Alle landen" || stay.land === selectedCountry;
      const queryMatch =
        !needle ||
        `${stay.name} ${stay.stad} ${stay.land} ${stay.adres}`.toLowerCase().includes(needle);
      return countryMatch && queryMatch;
    });
  }, [accommodations, query, selectedCountry]);

  const matchingHikes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return hikes.filter((hike) => {
      const countryMatch = selectedCountry === "Alle landen" || hike.land === selectedCountry;
      const queryMatch =
        !needle || `${hike.name} ${hike.land} ${hike.description}`.toLowerCase().includes(needle);
      return countryMatch && queryMatch;
    });
  }, [hikes, query, selectedCountry]);

  const selectedDay =
    countryTimeline.find((day) => day.id === selectedDayId) || countryTimeline[0] || null;
  const selectedHike = matchingHikes.find((hike) => hike.id === selectedHikeId) || matchingHikes[0] || null;

  const routePoints = useMemo(() => {
    const valid = countryTimeline.filter(
      (day) => Number.isFinite(day.gps?.lat) && Number.isFinite(day.gps?.lng),
    );
    if (!valid.length) return [];
    const lats = valid.map((day) => day.gps.lat);
    const lngs = valid.map((day) => day.gps.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latSpan = Math.max(maxLat - minLat, 0.01);
    const lngSpan = Math.max(maxLng - minLng, 0.01);
    return valid.map((day) => ({
      day,
      x: 8 + ((day.gps.lng - minLng) / lngSpan) * 84,
      y: 90 - ((day.gps.lat - minLat) / latSpan) * 80,
    }));
  }, [countryTimeline]);

  const routeLength = countryTimeline.length;
  const layerButtons: Array<{ key: LayerKey; label: string; icon: React.ElementType }> = [
    { key: "route", label: "Route", icon: Route },
    { key: "stays", label: "Verblijven", icon: BedDouble },
    { key: "saved", label: "Bewaard", icon: Star },
    { key: "hikes", label: "Wandelingen", icon: Mountain },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-[0.18em] text-[#39B8C8]">Reisoverzicht</p>
            <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900 dark:text-white">
              <Map className="h-6 w-6 text-[#174A7E] dark:text-[#39B8C8]" />
              Kaart & routes
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Bekijk de route per land en vind reisdagen, overnachtingen, bewaarde plekken en wandelingen zonder tussen losse schermen te wisselen.
            </p>
          </div>

          <div className="relative w-full xl:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Zoek plaats, verblijf of activiteit"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#39B8C8] focus:ring-2 focus:ring-[#39B8C8]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCountry("Alle landen")}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-black transition ${
              selectedCountry === "Alle landen"
                ? "bg-[#174A7E] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            Hele reis
          </button>
          {countryPlans.map((country) => (
            <button
              key={country.id}
              onClick={() => {
                setSelectedCountry(country.land);
                const firstDay = orderedTimeline.find((day) => day.land === country.land);
                setSelectedDayId(firstDay?.id || null);
              }}
              className={`shrink-0 rounded-xl px-4 py-2 text-xs font-black transition ${
                selectedCountry === country.land
                  ? "bg-[#174A7E] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {country.flag} {country.land}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white">
                {selectedCountry === "Alle landen" ? "Volledige wereldreis" : `Route door ${selectedCountry}`}
              </h3>
              <p className="text-xs text-slate-500">{routeLength} reisdagen in dit overzicht</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {layerButtons.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setLayers((current) => ({ ...current, [key]: !current[key] }))}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-black transition ${
                    layers[key]
                      ? "border-[#39B8C8]/40 bg-[#39B8C8]/10 text-[#174A7E] dark:text-[#7de4ef]"
                      : "border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-800"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-h-[430px] overflow-hidden bg-[radial-gradient(circle_at_20%_15%,rgba(57,184,200,0.18),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(23,74,126,0.18),transparent_32%),linear-gradient(145deg,#eef8fa,#f8fafc_48%,#eaf0f7)] dark:bg-[radial-gradient(circle_at_20%_15%,rgba(57,184,200,0.18),transparent_28%),radial-gradient(circle_at_80%_80%,rgba(23,74,126,0.3),transparent_32%),linear-gradient(145deg,#0f172a,#111827_48%,#172033)]">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(rgba(100,116,139,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(100,116,139,.14) 1px,transparent 1px)", backgroundSize: "38px 38px" }} />

            {routePoints.length > 0 && layers.route ? (
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polyline
                  points={routePoints.map((point) => `${point.x},${point.y}`).join(" ")}
                  fill="none"
                  stroke="#174A7E"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="2 1"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            ) : null}

            {routePoints.map(({ day, x, y }, index) => (
              <button
                key={day.id}
                onClick={() => setSelectedDayId(day.id)}
                className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 shadow-lg transition hover:scale-110 ${
                  selectedDay?.id === day.id
                    ? "h-9 w-9 border-white bg-[#174A7E] text-white"
                    : "h-7 w-7 border-white bg-[#39B8C8] text-[#174A7E]"
                }`}
                style={{ left: `${x}%`, top: `${y}%` }}
                title={`Dag ${day.dayNumber}: ${day.plaats}`}
              >
                <span className="text-[10px] font-black">{index + 1}</span>
              </button>
            ))}

            {routePoints.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <MapPin className="mb-3 h-10 w-10 text-slate-400" />
                <p className="font-bold text-slate-700 dark:text-slate-200">Geen GPS-punten gevonden</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">Voeg GPS-coördinaten toe aan de reisdagen om hier een route te tekenen.</p>
              </div>
            )}

            <div className="absolute bottom-4 left-4 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Zichtbare lagen</p>
              <p className="mt-0.5 text-sm font-black text-slate-800 dark:text-white">
                {Object.values(layers).filter(Boolean).length} van 4 actief
              </p>
            </div>
          </div>

          {selectedDay && (
            <div className="grid gap-4 border-t border-slate-100 p-5 dark:border-slate-800 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-[#174A7E]/10 px-2.5 py-1 text-[10px] font-black uppercase text-[#174A7E] dark:text-[#7de4ef]">
                    Dag {selectedDay.dayNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{dateOnly(selectedDay.date)}</span>
                </div>
                <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-white">{selectedDay.plaats}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedDay.activiteiten.length
                    ? selectedDay.activiteiten.slice(0, 3).join(" • ")
                    : "Nog geen activiteiten toegevoegd"}
                </p>
              </div>
              <button
                onClick={() => openDirections(selectedDay.gps.lat, selectedDay.gps.lng)}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#174A7E] px-4 py-3 text-xs font-black text-white transition hover:bg-[#10395f]"
              >
                <Navigation className="h-4 w-4" /> Open in Maps
              </button>
            </div>
          )}
        </section>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-[#39B8C8]">Langs de route</p>
                <h3 className="font-black text-slate-900 dark:text-white">Overzicht locaties</h3>
              </div>
              <Flag className="h-5 w-5 text-[#174A7E] dark:text-[#39B8C8]" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
                <p className="text-xl font-black text-slate-900 dark:text-white">{matchingAccommodations.length}</p>
                <p className="text-[10px] font-bold text-slate-500">Verblijven</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
                <p className="text-xl font-black text-slate-900 dark:text-white">{matchingSavedLocations.length}</p>
                <p className="text-[10px] font-bold text-slate-500">Bewaard</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800">
                <p className="text-xl font-black text-slate-900 dark:text-white">{matchingHikes.length}</p>
                <p className="text-[10px] font-bold text-slate-500">Wandelingen</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {layers.stays && matchingAccommodations.slice(0, 3).map((stay) => (
                <button
                  key={stay.id}
                  onClick={() => stay.mapsUrl ? window.open(stay.mapsUrl, "_blank", "noopener,noreferrer") : undefined}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 p-3 text-left transition hover:border-[#39B8C8]/40 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <span className="rounded-xl bg-amber-100 p-2 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"><BedDouble className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-black text-slate-800 dark:text-white">{stay.name}</span>
                    <span className="block truncate text-[10px] text-slate-500">{stay.stad}, {stay.land}</span>
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </button>
              ))}

              {layers.saved && matchingSavedLocations.slice(0, 3).map((location) => (
                <button
                  key={location.id}
                  onClick={() => openDirections(location.gps.lat, location.gps.lng)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 p-3 text-left transition hover:border-[#39B8C8]/40 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <span className="rounded-xl bg-violet-100 p-2 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"><Star className="h-4 w-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-black text-slate-800 dark:text-white">{location.naam}</span>
                    <span className="block truncate text-[10px] text-slate-500">{location.adres || location.category}</span>
                  </span>
                  <Navigation className="h-3.5 w-3.5 text-slate-400" />
                </button>
              ))}

              {!matchingAccommodations.length && !matchingSavedLocations.length && (
                <p className="rounded-2xl bg-slate-50 p-4 text-center text-xs text-slate-500 dark:bg-slate-800">Geen locaties gevonden met deze filters.</p>
              )}
            </div>

            <button
              onClick={() => onNavigate?.("navigatie")}
              className="mt-4 flex w-full items-center justify-between rounded-2xl bg-slate-100 px-4 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            >
              Alle opgeslagen locaties beheren <ChevronRight className="h-4 w-4" />
            </button>
          </section>

          {layers.hikes && selectedHike && (
            <section className="rounded-3xl bg-gradient-to-br from-[#174A7E] to-[#10395f] p-5 text-white shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-[#8ce8f1]">Uitgelichte wandeling</p>
                  <h3 className="mt-1 text-lg font-black">{selectedHike.name}</h3>
                  <p className="mt-1 text-xs text-white/70">{selectedHike.land} · {selectedHike.difficulty}</p>
                </div>
                <Mountain className="h-6 w-6 text-[#39B8C8]" />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-white/10 p-2.5"><p className="text-[9px] text-white/60">Afstand</p><p className="text-sm font-black">{selectedHike.distanceKm} km</p></div>
                <div className="rounded-xl bg-white/10 p-2.5"><p className="text-[9px] text-white/60">Duur</p><p className="text-sm font-black">{selectedHike.durationHours} uur</p></div>
                <div className="rounded-xl bg-white/10 p-2.5"><p className="text-[9px] text-white/60">Stijging</p><p className="text-sm font-black">+{selectedHike.elevationGainM} m</p></div>
              </div>

              <button
                onClick={() => exportHikeToGPX(selectedHike)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#39B8C8] px-4 py-3 text-xs font-black text-[#10395f] transition hover:bg-[#65d8e4]"
              >
                <Download className="h-4 w-4" /> Download GPX
              </button>

              {matchingHikes.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {matchingHikes.map((hike) => (
                    <button
                      key={hike.id}
                      onClick={() => setSelectedHikeId(hike.id)}
                      className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-bold ${selectedHike.id === hike.id ? "bg-white text-[#174A7E]" : "bg-white/10 text-white/80"}`}
                    >
                      {hike.name}
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
};

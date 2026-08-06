import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Compass,
  ExternalLink,
  Home,
  MapPin,
  Navigation,
  Plane,
  Search,
  Star,
  Ticket,
} from "lucide-react";
import {
  Accommodation,
  ActivityItem,
  CountryPlan,
  Flight,
  SavedLocation,
  TimelineDay,
} from "../types";

interface ReisplanningViewProps {
  countries: CountryPlan[];
  timeline: TimelineDay[];
  accommodations: Accommodation[];
  activities: ActivityItem[];
  flights: Flight[];
  savedLocations: SavedLocation[];
  setActiveTab?: (tab: string) => void;
}

const dateOnly = (value?: string) => (value || "").slice(0, 10);

const parseDate = (value?: string) => {
  const clean = dateOnly(value);
  if (!clean) return null;
  const parsed = new Date(`${clean}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value?: string) => {
  const parsed = parseDate(value);
  return parsed
    ? new Intl.DateTimeFormat("nl-NL", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }).format(parsed)
    : value || "Datum onbekend";
};

const includesLoose = (source?: string, target?: string) => {
  const a = (source || "").toLocaleLowerCase("nl-NL").trim();
  const b = (target || "").toLocaleLowerCase("nl-NL").trim();
  return Boolean(a && b && (a.includes(b) || b.includes(a)));
};

export const ReisplanningView: React.FC<ReisplanningViewProps> = ({
  countries = [],
  timeline = [],
  accommodations = [],
  activities = [],
  flights = [],
  savedLocations = [],
  setActiveTab,
}) => {
  const sortedCountries = useMemo(
    () => [...countries].sort((a, b) => dateOnly(a.startDate).localeCompare(dateOnly(b.startDate))),
    [countries]
  );

  const [selectedCountryId, setSelectedCountryId] = useState<string>(
    sortedCountries[0]?.id || ""
  );
  const [search, setSearch] = useState("");
  const [expandedDayId, setExpandedDayId] = useState<string | null>(null);

  const currentCountry =
    sortedCountries.find((country) => country.id === selectedCountryId) || sortedCountries[0];

  const countryDays = useMemo(() => {
    if (!currentCountry) return [];
    const query = search.toLocaleLowerCase("nl-NL").trim();

    return [...timeline]
      .filter((day) => day.land === currentCountry.land)
      .filter((day) => {
        if (!query) return true;
        return [
          day.plaats,
          day.overnachting,
          day.notities,
          day.samenvatting,
          ...(day.activiteiten || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("nl-NL")
          .includes(query);
      })
      .sort((a, b) => dateOnly(a.date).localeCompare(dateOnly(b.date)));
  }, [currentCountry, timeline, search]);

  const countryAccommodations = currentCountry
    ? accommodations.filter((item) => item.land === currentCountry.land)
    : [];
  const countryActivities = currentCountry
    ? activities.filter((item) => item.land === currentCountry.land)
    : [];
  const countryFlights = currentCountry
    ? flights.filter((flight) =>
        countryDays.some((day) => dateOnly(day.date) === dateOnly(flight.departureDate))
      )
    : [];

  if (!currentCountry) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
        <Compass className="mx-auto mb-3 h-10 w-10 text-slate-400" />
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Nog geen reisplanning</h2>
        <p className="mt-1 text-sm text-slate-500">Voeg eerst landen en reisdagen toe.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <section className="overflow-hidden rounded-3xl bg-[#174A7E] p-6 text-white shadow-lg">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#8DE4EC]">Volledige reisroute</p>
            <h1 className="mt-2 text-3xl font-black">Reisplanning</h1>
            <p className="mt-2 max-w-2xl text-sm text-blue-100">
              Bekijk de reis dag voor dag. Open een dag voor verblijf, vervoer, activiteiten en handige adressen.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xl font-black">{timeline.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-100">Reisdagen</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xl font-black">{sortedCountries.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-100">Landen</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xl font-black">{flights.length}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-100">Vluchten</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {sortedCountries.map((country) => {
          const selected = country.id === currentCountry.id;
          const dayCount = timeline.filter((day) => day.land === country.land).length;
          return (
            <button
              key={country.id}
              onClick={() => {
                setSelectedCountryId(country.id);
                setExpandedDayId(null);
                setSearch("");
              }}
              className={`shrink-0 rounded-2xl border px-4 py-3 text-left transition ${
                selected
                  ? "border-[#174A7E] bg-[#174A7E] text-white shadow-md"
                  : "border-slate-200 bg-white text-slate-700 hover:border-[#39B8C8] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{country.flag}</span>
                <span className="font-black">{country.land}</span>
              </div>
              <p className={`mt-1 text-[11px] font-semibold ${selected ? "text-blue-100" : "text-slate-400"}`}>
                {dayCount} dagen · {formatDate(country.startDate)}
              </p>
            </button>
          );
        })}
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[#39B8C8]">
              {formatDate(currentCountry.startDate)} – {formatDate(currentCountry.endDate)}
            </p>
            <h2 className="mt-1 flex items-center gap-2 text-2xl font-black text-slate-900 dark:text-white">
              <span>{currentCountry.flag}</span> {currentCountry.land}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {currentCountry.routeDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(currentCountry.highlightCities || []).map((city) => (
              <span key={city} className="rounded-full bg-[#F3E7C8] px-3 py-1.5 text-xs font-bold text-[#174A7E]">
                {city}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Zoek in ${currentCountry.land} op plaats, activiteit of verblijf`}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-[#39B8C8] focus:ring-2 focus:ring-[#39B8C8]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Dag voor dag</h3>
            <p className="text-sm text-slate-500">{countryDays.length} dagen zichtbaar</p>
          </div>
          <button
            onClick={() => setActiveTab?.("timeline")}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-[#174A7E] hover:bg-slate-50 dark:border-slate-700 dark:text-[#8DE4EC] dark:hover:bg-slate-800"
          >
            Bewerk tijdlijn
          </button>
        </div>

        {countryDays.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <CalendarDays className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 font-bold text-slate-700 dark:text-slate-200">Geen reisdagen gevonden</p>
            <p className="text-sm text-slate-500">Pas je zoekopdracht aan of voeg dagen toe aan de tijdlijn.</p>
          </div>
        ) : (
          countryDays.map((day, index) => {
            const nextDay = countryDays[index + 1];
            const dayFlights = flights.filter(
              (flight) => dateOnly(flight.departureDate) === dateOnly(day.date)
            );
            const dayAccommodation = countryAccommodations.find((acc) => {
              const start = dateOnly(acc.checkIn);
              const end = dateOnly(acc.checkOut);
              const date = dateOnly(day.date);
              return (start && end && date >= start && date < end) || includesLoose(acc.stad, day.plaats) || includesLoose(acc.name, day.overnachting);
            });
            const dayActivities = countryActivities.filter(
              (activity) =>
                includesLoose(activity.location, day.plaats) ||
                (day.activiteiten || []).some((name) => includesLoose(activity.name, name))
            );
            const nearbyLocations = savedLocations.filter(
              (location) => includesLoose(location.adres, day.plaats) || includesLoose(location.naam, day.plaats)
            );
            const expanded = expandedDayId === day.id;

            return (
              <article key={day.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <button
                  onClick={() => setExpandedDayId(expanded ? null : day.id)}
                  className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-[#EAF7F8] text-[#174A7E] dark:bg-[#174A7E]/30 dark:text-[#8DE4EC]">
                    <span className="text-[10px] font-black uppercase">Dag</span>
                    <span className="text-xl font-black leading-none">{day.dayNumber}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <h4 className="truncate text-base font-black text-slate-900 dark:text-white">{day.plaats}</h4>
                      <span className="text-xs font-semibold text-slate-400">{formatDate(day.date)}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      {day.overnachting && <span className="flex items-center gap-1"><Home className="h-3.5 w-3.5" />{day.overnachting}</span>}
                      {(day.activiteiten || []).length > 0 && <span className="flex items-center gap-1"><Ticket className="h-3.5 w-3.5" />{day.activiteiten.length} activiteiten</span>}
                      {dayFlights.length > 0 && <span className="flex items-center gap-1 font-bold text-[#174A7E] dark:text-[#8DE4EC]"><Plane className="h-3.5 w-3.5" />Vliegdag</span>}
                    </div>
                  </div>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition ${expanded ? "rotate-180" : ""}`} />
                </button>

                {expanded && (
                  <div className="border-t border-slate-100 p-4 dark:border-slate-800">
                    <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
                      <div className="space-y-4">
                        {(day.samenvatting || day.notities) && (
                          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                            <p className="text-xs font-black uppercase tracking-wide text-slate-400">Dagplan</p>
                            <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">{day.samenvatting || day.notities}</p>
                          </div>
                        )}

                        {(day.activiteiten || []).length > 0 && (
                          <div>
                            <p className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">Activiteiten</p>
                            <div className="space-y-2">
                              {day.activiteiten.map((activity, activityIndex) => (
                                <div key={`${day.id}-${activityIndex}`} className="flex gap-3 rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
                                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F3E7C8] text-xs font-black text-[#174A7E]">{activityIndex + 1}</div>
                                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{activity}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {dayFlights.map((flight) => (
                          <div key={flight.id} className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-black uppercase tracking-wide text-blue-500">Vlucht {flight.flightNumber}</p>
                                <p className="mt-1 text-base font-black text-slate-900 dark:text-white">{flight.fromCity} → {flight.toCity}</p>
                                <p className="mt-1 text-xs text-slate-500">{flight.departureTime} – {flight.arrivalTime} · Terminal {flight.terminal}</p>
                              </div>
                              <Plane className="h-5 w-5 text-[#174A7E] dark:text-[#8DE4EC]" />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <InfoCard
                          icon={<Home className="h-4 w-4" />}
                          label="Overnachting"
                          title={dayAccommodation?.name || day.overnachting || "Nog niet ingevuld"}
                          detail={dayAccommodation?.adres || (day.overnachting ? `In ${day.plaats}` : "Voeg een verblijf toe")}
                          onClick={() => dayAccommodation && setActiveTab?.("accommodaties")}
                        />
                        {nextDay && (
                          <InfoCard
                            icon={<Navigation className="h-4 w-4" />}
                            label="Volgende etappe"
                            title={`${day.plaats} → ${nextDay.plaats}`}
                            detail={`${formatDate(nextDay.date)} · dag ${nextDay.dayNumber}`}
                            onClick={() => setExpandedDayId(nextDay.id)}
                          />
                        )}
                        {dayActivities.slice(0, 2).map((activity) => (
                          <InfoCard
                            key={activity.id}
                            icon={<Star className="h-4 w-4" />}
                            label="Gerelateerde activiteit"
                            title={activity.name}
                            detail={`${activity.durationHours} uur · €${activity.priceEur} · ${activity.kidFriendlyScore}/5 kinderen`}
                            href={activity.ticketsUrl}
                          />
                        ))}
                        {nearbyLocations.slice(0, 2).map((location) => (
                          <InfoCard
                            key={location.id}
                            icon={<MapPin className="h-4 w-4" />}
                            label="Bewaarde plek"
                            title={location.naam}
                            detail={location.adres}
                            onClick={() => setActiveTab?.("navigatie")}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard icon={<Plane className="h-5 w-5" />} value={countryFlights.length} label="vluchten in deze etappe" />
        <SummaryCard icon={<Home className="h-5 w-5" />} value={countryAccommodations.length} label="vaste accommodaties" />
        <SummaryCard icon={<Ticket className="h-5 w-5" />} value={countryActivities.length} label="opgeslagen activiteiten" />
      </section>
    </div>
  );
};

const SummaryCard = ({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) => (
  <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF7F8] text-[#174A7E] dark:bg-[#174A7E]/30 dark:text-[#8DE4EC]">{icon}</div>
    <div><p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p><p className="text-xs font-semibold text-slate-500">{label}</p></div>
  </div>
);

const InfoCard = ({ icon, label, title, detail, onClick, href }: { key?: React.Key; icon: React.ReactNode; label: string; title: string; detail: string; onClick?: () => void; href?: string }) => {
  const content = (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-3 text-left transition hover:border-[#39B8C8] hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
      <div className="mt-0.5 text-[#174A7E] dark:text-[#8DE4EC]">{icon}</div>
      <div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</p><p className="truncate text-sm font-black text-slate-800 dark:text-white">{title}</p><p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{detail}</p></div>
      {href ? <ExternalLink className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
    </div>
  );
  return href ? <a href={href} target="_blank" rel="noreferrer">{content}</a> : <button className="w-full" onClick={onClick}>{content}</button>;
};

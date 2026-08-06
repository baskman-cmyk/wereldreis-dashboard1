import React from "react";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Clock3,
  FileWarning,
  MapPin,
  Plane,
  Sparkles,
  Wallet,
} from "lucide-react";
import { DashboardWidgetConfig, TabType, TripDataState } from "../types";

interface DashboardViewProps {
  data: TripDataState;
  setActiveTab: (tab: TabType) => void;
  onUpdateWidgets: (widgets: DashboardWidgetConfig[]) => void;
  onOpenAssistant: () => void;
}

const getLocalIsoDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const dateOnly = (value: string) => value.slice(0, 10);

const daysBetween = (from: string, to: string) =>
  Math.ceil(
    (new Date(`${to}T12:00:00`).getTime() - new Date(`${from}T12:00:00`).getTime()) /
      86_400_000,
  );

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${dateOnly(value)}T12:00:00`));

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  setActiveTab,
  onOpenAssistant,
}) => {
  const today = getLocalIsoDate();
  const sortedDays = [...data.timeline].sort((a, b) => a.date.localeCompare(b.date));
  const exactDay = sortedDays.find((day) => day.date === today);
  const nextDay = sortedDays.find((day) => day.date > today);
  const currentDay = exactDay || nextDay || sortedDays.at(-1);

  const beforeTrip = today < data.overview.startDate;
  const afterTrip = today > data.overview.endDate;
  const daysUntilDeparture = Math.max(0, daysBetween(today, data.overview.startDate));
  const tripDayNumber = Math.max(
    1,
    Math.min(data.overview.totalDays, daysBetween(data.overview.startDate, today) + 1),
  );

  const nextFlight = [...data.flights]
    .filter((flight) => flight.departureDate >= today)
    .sort((a, b) =>
      `${a.departureDate} ${a.departureTime}`.localeCompare(`${b.departureDate} ${b.departureTime}`),
    )[0];

  const nextAccommodation = [...data.accommodations]
    .filter((item) => dateOnly(item.checkOut) >= today)
    .sort((a, b) => dateOnly(a.checkIn).localeCompare(dateOnly(b.checkIn)))[0];

  const openChecks = data.checklists.filter((item) => !item.completed);
  const unreadUrgentNotifications = data.notifications.filter(
    (item) => !item.read && item.urgent,
  );
  const upcomingDocuments = data.documents
    .filter((item) => item.vervaldatum && item.vervaldatum >= today)
    .sort((a, b) => (a.vervaldatum || "").localeCompare(b.vervaldatum || ""));

  const spent = data.categoryBudgets.reduce((sum, item) => sum + item.spentEur, 0);
  const budget = data.categoryBudgets.reduce((sum, item) => sum + item.budgetEur, 0);
  const remaining = Math.max(0, budget - spent);
  const budgetPercentage = budget ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

  const location = currentDay
    ? `${currentDay.plaats}, ${currentDay.land}`
    : `${data.overview.currentCity}, ${data.overview.currentCountry}`;

  const statusLabel = beforeTrip
    ? "De wereldreis komt eraan"
    : afterTrip
      ? "De reis is afgerond"
      : "Jullie zijn onderweg";

  const headline = beforeTrip
    ? `Nog ${daysUntilDeparture} ${daysUntilDeparture === 1 ? "dag" : "dagen"} tot vertrek`
    : afterTrip
      ? "Welkom thuis"
      : `Reisdag ${tripDayNumber} van ${data.overview.totalDays}`;

  const focusItems = [
    ...unreadUrgentNotifications.slice(0, 2).map((item) => ({
      id: `notification-${item.id}`,
      title: item.title,
      detail: item.description,
      tab: "meldingen" as TabType,
      urgent: true,
    })),
    ...openChecks.slice(0, 3).map((item) => ({
      id: `check-${item.id}`,
      title: item.text,
      detail: item.countryScope ? `Voor ${item.countryScope}` : "Voor vertrek",
      tab: "checklist" as TabType,
      urgent: false,
    })),
  ].slice(0, 4);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#174A7E] via-[#17628a] to-[#1693a4] p-6 text-white shadow-lg md:p-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-cyan-200/10" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100">
              {statusLabel}
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">{headline}</h1>
            <p className="mt-3 flex items-center gap-2 text-cyan-50">
              <MapPin className="h-4 w-4" /> {location}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("today")}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-[#174A7E] shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <CalendarDays className="h-5 w-5" /> Open reisdag <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Open taken"
          value={`${openChecks.length}`}
          note={openChecks[0]?.text || "Alles is geregeld"}
          icon={CheckSquare}
          onClick={() => setActiveTab("checklist")}
        />
        <Metric
          title="Budget over"
          value={formatMoney(remaining)}
          note={`${budgetPercentage}% van het budget gebruikt`}
          icon={Wallet}
          onClick={() => setActiveTab("budget")}
        />
        <Metric
          title="Documenten"
          value={`${upcomingDocuments.length}`}
          note={
            upcomingDocuments[0]?.vervaldatum
              ? `${upcomingDocuments[0].titel} vervalt ${formatDate(upcomingDocuments[0].vervaldatum)}`
              : "Geen komende vervaldatums"
          }
          icon={FileWarning}
          onClick={() => setActiveTab("documenten")}
        />
        <Metric
          title="Meldingen"
          value={`${unreadUrgentNotifications.length}`}
          note={unreadUrgentNotifications[0]?.title || "Geen urgente meldingen"}
          icon={CheckCircle2}
          onClick={() => setActiveTab("meldingen")}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-black">
              <Plane className="text-[#1693a4]" /> Volgende vlucht
            </h2>
            <button
              type="button"
              onClick={() => setActiveTab("vluchten")}
              className="text-xs font-black text-[#174A7E] dark:text-cyan-300"
            >
              Alle vluchten
            </button>
          </div>

          {nextFlight ? (
            <div className="mt-5 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {formatDate(nextFlight.departureDate)} · {nextFlight.airline}
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    {nextFlight.fromCode} <span className="text-[#1693a4]">→</span> {nextFlight.toCode}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {nextFlight.flightNumber} · vertrek {nextFlight.departureTime}
                  </p>
                </div>
                <span className="rounded-xl bg-white p-3 text-slate-400 shadow-sm dark:bg-slate-900">
                  <Clock3 className="h-5 w-5" />
                </span>
              </div>
            </div>
          ) : (
            <EmptyLine text="Geen komende vlucht ingevoerd." />
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-black">
              <BedDouble className="text-[#1693a4]" /> Volgende verblijf
            </h2>
            <button
              type="button"
              onClick={() => setActiveTab("accommodaties")}
              className="text-xs font-black text-[#174A7E] dark:text-cyan-300"
            >
              Alle verblijven
            </button>
          </div>

          {nextAccommodation ? (
            <div className="mt-5 flex gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={nextAccommodation.foto}
                  alt={nextAccommodation.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 py-1">
                <p className="truncate font-black">{nextAccommodation.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {nextAccommodation.stad}, {nextAccommodation.land}
                </p>
                <p className="mt-3 text-xs font-bold text-slate-500">
                  {formatDate(nextAccommodation.checkIn)} t/m {formatDate(nextAccommodation.checkOut)}
                </p>
              </div>
            </div>
          ) : (
            <EmptyLine text="Geen volgend verblijf gevonden." />
          )}
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black">Nu regelen</h2>
            <button
              type="button"
              onClick={() => setActiveTab("checklist")}
              className="text-xs font-black text-[#174A7E] dark:text-cyan-300"
            >
              Hele checklist
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {focusItems.length ? (
              focusItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.tab)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 p-3 text-left transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                >
                  <span
                    className={`h-3 w-3 shrink-0 rounded-full ${item.urgent ? "bg-rose-500" : "bg-amber-400"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold">{item.title}</span>
                    <span className="block truncate text-xs text-slate-500">{item.detail}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </button>
              ))
            ) : (
              <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                Alles wat nu aandacht nodig heeft is geregeld.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">Reisbudget</p>
              <h2 className="mt-1 text-2xl font-black">{formatMoney(spent)} uitgegeven</h2>
            </div>
            <Wallet className="h-6 w-6 text-[#1693a4]" />
          </div>
          <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-[#1693a4] transition-all"
              style={{ width: `${budgetPercentage}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between text-xs font-bold text-slate-500">
            <span>{budgetPercentage}% gebruikt</span>
            <span>{formatMoney(budget)} totaal</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("budget")}
            className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#174A7E] dark:text-cyan-300"
          >
            Bekijk budget <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      </div>

      <button
        type="button"
        onClick={onOpenAssistant}
        className="flex w-full items-center gap-4 rounded-3xl border border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50 p-5 text-left transition hover:shadow-md dark:border-cyan-900 dark:from-cyan-950/40 dark:to-blue-950/40"
      >
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#1693a4] text-white">
          <Sparkles className="h-5 w-5" />
        </span>
        <span>
          <span className="block font-black">Vraag het de reisassistent</span>
          <span className="block text-sm text-slate-500">
            Zoek in vluchten, accommodaties, documenten en planning.
          </span>
        </span>
        <ArrowRight className="ml-auto h-5 w-5" />
      </button>
    </div>
  );
};

const Metric = ({
  title,
  value,
  note,
  icon: Icon,
  onClick,
}: {
  title: string;
  value: string;
  note: string;
  icon: React.ElementType;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
  >
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs font-black uppercase tracking-wider text-slate-500">{title}</p>
      <Icon className="h-5 w-5 text-[#1693a4]" />
    </div>
    <p className="mt-3 text-2xl font-black">{value}</p>
    <p className="mt-1 line-clamp-2 min-h-8 text-xs text-slate-500">{note}</p>
  </button>
);

const EmptyLine = ({ text }: { text: string }) => (
  <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500 dark:bg-slate-800">
    {text}
  </div>
);

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Compass,
  FileCheck2,
  Luggage,
  MapPinned,
  Plane,
  RefreshCw,
  RotateCcw,
  Send,
  Sparkles,
  User,
  Wifi,
  X,
} from "lucide-react";
import { TripDataState } from "../types";

interface AiReisassistentModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TripDataState;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  source?: "reisdata" | "online-ai";
}

const formatDate = (value: string) => {
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(value);

const normalizeDate = (value: string) => value.slice(0, 10);

const nowLabel = () =>
  new Date().toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });

const createAssistantMessage = (
  text: string,
  source: ChatMessage["source"] = "reisdata"
): ChatMessage => ({
  id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  sender: "assistant",
  text,
  timestamp: nowLabel(),
  source,
});

function answerFromTripData(prompt: string, data: TripDataState): string | null {
  const question = prompt.toLocaleLowerCase("nl-NL");
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  const upcomingFlights = [...data.flights]
    .filter((flight) => normalizeDate(flight.departureDate) >= todayKey)
    .sort((a, b) =>
      `${a.departureDate} ${a.departureTime}`.localeCompare(`${b.departureDate} ${b.departureTime}`)
    );

  const timelineSorted = [...data.timeline].sort((a, b) => a.date.localeCompare(b.date));
  const currentDay =
    timelineSorted.find((day) => day.date === todayKey) ||
    timelineSorted.find((day) => day.date >= todayKey) ||
    timelineSorted[timelineSorted.length - 1];

  if (/volgende vlucht|vlucht.*vertrek|hoe laat.*vlucht|boarding|gate/.test(question)) {
    const flight = upcomingFlights[0] || data.flights[data.flights.length - 1];
    if (!flight) return "Er staat nog geen vlucht in de reisgegevens.";
    return [
      `De eerstvolgende vlucht is **${flight.flightNumber} van ${flight.airline}**.`,
      `${flight.fromCity} (${flight.fromCode}) → ${flight.toCity} (${flight.toCode})`,
      `Vertrek: ${formatDate(flight.departureDate)} om ${flight.departureTime}.`,
      flight.terminal ? `Terminal: ${flight.terminal}.` : "",
      flight.gate ? `Gate: ${flight.gate}.` : "",
      flight.seat ? `Stoelen: ${flight.seat}.` : "",
      `Status: ${flight.status}${flight.delayMinutes ? `, ${flight.delayMinutes} minuten vertraging` : ""}.`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (/wifi|wachtwoord|internet.*accommodatie/.test(question)) {
    const match = data.accommodations.find((accommodation) =>
      [accommodation.name, accommodation.stad, accommodation.land]
        .join(" ")
        .toLocaleLowerCase("nl-NL")
        .split(/\s+/)
        .some((word) => word.length > 3 && question.includes(word))
    );
    const accommodation = match || data.accommodations.find((item) => item.wifiCode);
    if (!accommodation) return "Ik vind nog geen wifi-code in de accommodaties.";
    return `De wifi-code van **${accommodation.name}** in ${accommodation.stad} is: **${accommodation.wifiCode || "nog niet ingevuld"}**.`;
  }

  if (/overnachting|hotel|accommodatie|waar slapen/.test(question)) {
    const stay = data.accommodations.find((item) => {
      const start = normalizeDate(item.checkIn);
      const end = normalizeDate(item.checkOut);
      return currentDay && currentDay.date >= start && currentDay.date <= end;
    });
    if (!stay) return "Ik kan voor de gekozen reisdag geen gekoppelde accommodatie vinden.";
    return [
      `Jullie verblijven bij **${stay.name}** in ${stay.stad}, ${stay.land}.`,
      `Adres: ${stay.adres}.`,
      `Check-in: ${stay.checkIn}. Check-out: ${stay.checkOut}.`,
      stay.boekingsnummer ? `Boekingsnummer: ${stay.boekingsnummer}.` : "",
      stay.bijzonderheden ? `Let op: ${stay.bijzonderheden}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (/vandaag|dagplanning|wat doen we|planning van de dag|reisdag/.test(question)) {
    if (!currentDay) return "Er staan nog geen reisdagen in de planning.";
    const activities = currentDay.activiteiten.length
      ? currentDay.activiteiten.map((item) => `• ${item}`).join("\n")
      : "• Nog geen activiteiten ingevoerd";
    return [
      `**Reisdag ${currentDay.dayNumber}: ${currentDay.plaats}, ${currentDay.land}**`,
      formatDate(currentDay.date),
      activities,
      currentDay.overnachting ? `Overnachting: ${currentDay.overnachting}.` : "",
      currentDay.notities ? `Notitie: ${currentDay.notities}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (/wandeling|hike|trail|wandelroute/.test(question)) {
    const hike = data.hikes.find((item) =>
      [item.name, item.land].join(" ").toLocaleLowerCase("nl-NL").split(/\s+/).some((word) => word.length > 3 && question.includes(word))
    ) || data.hikes[0];
    if (!hike) return "Er staan nog geen wandelingen in de reisgegevens.";
    return [
      `**${hike.name}** in ${hike.land}`,
      `Afstand: ${hike.distanceKm} km.`,
      `Duur: ${hike.durationHours} uur.`,
      `Niveau: ${hike.difficulty}.`,
      hike.description ? `Beschrijving: ${hike.description}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (/budget|uitgegeven|geld|kosten|nog over|dagbudget/.test(question)) {
    const totalBudget = data.categoryBudgets.reduce((sum, item) => sum + item.budgetEur, 0);
    const totalSpent = data.budgetExpenses.reduce((sum, item) => sum + item.amountEur, 0);
    const remaining = totalBudget - totalSpent;
    const largestCategory = [...data.categoryBudgets].sort((a, b) => b.spentEur - a.spentEur)[0];
    return [
      `Totaal budget: **${formatMoney(totalBudget)}**.`,
      `Uitgegeven: **${formatMoney(totalSpent)}**.`,
      `Nog beschikbaar: **${formatMoney(remaining)}**.`,
      largestCategory ? `Grootste uitgavencategorie: ${largestCategory.label} (${formatMoney(largestCategory.spentEur)}).` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (/document|paspoort|esta|visum|verzekering|verloopt/.test(question)) {
    const datedDocuments = data.documents
      .filter((item) => item.vervaldatum)
      .sort((a, b) => (a.vervaldatum || "").localeCompare(b.vervaldatum || ""));
    const expired = datedDocuments.filter((item) => (item.vervaldatum || "") < todayKey);
    const upcoming = datedDocuments.filter((item) => (item.vervaldatum || "") >= todayKey).slice(0, 4);
    const lines = upcoming.map(
      (item) => `• ${item.titel}${item.familyMemberName ? ` – ${item.familyMemberName}` : ""}: geldig tot ${formatDate(item.vervaldatum || "")}`
    );
    return [
      `Er staan **${data.documents.length} documenten** in de app.`,
      expired.length ? `Let op: ${expired.length} document(en) zijn volgens de ingevoerde datum verlopen.` : "Er zijn geen verlopen documenten gevonden.",
      lines.length ? `Eerstvolgende verloopdatums:\n${lines.join("\n")}` : "Er zijn geen verloopdatums ingevuld.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (/paklijst|inpakken|koffer|nog kopen/.test(question)) {
    const total = data.packingItems.length;
    const packed = data.packingItems.filter((item) => ["In koffer", "In camper"].includes(item.status)).length;
    const buy = data.packingItems.filter((item) => item.status === "Nog kopen");
    return [
      `Van de **${total} paklijstitems** zijn er **${packed} ingepakt**.`,
      `Nog kopen: ${buy.length}.`,
      buy.length ? buy.slice(0, 6).map((item) => `• ${item.item} (${item.toegewezenAan})`).join("\n") : "Alles wat op de kooplijst stond is geregeld.",
    ].join("\n");
  }

  if (/checklist|nog regelen|openstaande taak|voor vertrek/.test(question)) {
    const open = data.checklists.filter((item) => !item.completed);
    return [
      `Er staan **${open.length} openstaande acties** op de checklist.`,
      open.length ? open.slice(0, 8).map((item) => `• ${item.text}${item.countryScope ? ` – ${item.countryScope}` : ""}`).join("\n") : "Alle checklisttaken zijn afgevinkt.",
    ].join("\n");
  }

  if (/camper|kilometerstand|watertank|gas|afvalwater/.test(question)) {
    const camper = data.camper;
    return [
      `Camper: **${camper.modelName}** (${camper.licensePlate}).`,
      `Kilometerstand: ${camper.kilometerstand.toLocaleString("nl-NL")} km.`,
      `Gas: ${camper.tankLevels.gasPercent}%. Water: ${camper.tankLevels.waterPercent}%. Afvalwater: ${camper.tankLevels.afvalwaterPercent}%.`,
      `Ophalen: ${camper.ophaallocatie} op ${formatDate(camper.ophaaldatum)}.`,
      `Inleveren: ${camper.inleverlocatie} op ${formatDate(camper.inleverdatum)}.`,
    ].join("\n");
  }

  if (/supermarkt|restaurant|opgeslagen plek|adres/.test(question)) {
    const category = question.includes("supermarkt")
      ? "supermarket"
      : question.includes("restaurant")
        ? "restaurant"
        : null;
    const places = data.savedLocations.filter((item) => !category || item.category === category);
    if (!places.length) return "Ik vind daarvoor nog geen opgeslagen locaties.";
    return places
      .slice(0, 5)
      .map((item) => `• **${item.naam}** – ${item.adres}${item.openingstijden ? ` – ${item.openingstijden}` : ""}`)
      .join("\n");
  }

  return null;
}

export const AiReisassistentModal: React.FC<AiReisassistentModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const familyNames = data.familyMembers.map((member) => member.naam).join(", ");
  const firstMessage = useMemo(
    () =>
      createAssistantMessage(
        `Hoi ${familyNames || "familie"}! Ik help met jullie eigen reisgegevens. Vraag bijvoorbeeld naar de volgende vlucht, de planning van vandaag, een wifi-code, openstaande documenten, het budget of de paklijst.`
      ),
    [familyNames]
  );

  const [messages, setMessages] = useState<ChatMessage[]>([firstMessage]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && messages.length === 0) setMessages([firstMessage]);
  }, [isOpen, messages.length, firstMessage]);

  if (!isOpen) return null;

  const presetQuestions = [
    { label: "Volgende vlucht", prompt: "Hoe laat vertrekt onze volgende vlucht?", icon: Plane },
    { label: "Vandaag", prompt: "Wat staat er vandaag op de planning?", icon: MapPinned },
    { label: "Budget", prompt: "Hoeveel budget hebben we nog over?", icon: CircleDollarSign },
    { label: "Documenten", prompt: "Welke documenten verlopen als eerste?", icon: FileCheck2 },
    { label: "Paklijst", prompt: "Wat moeten we nog kopen of inpakken?", icon: Luggage },
    { label: "Wifi", prompt: "Wat is het wifi-wachtwoord van onze accommodatie?", icon: Wifi },
  ];

  const handleSend = async (textToSend?: string) => {
    const promptText = (textToSend || inputPrompt).trim();
    if (!promptText || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: promptText,
      timestamp: nowLabel(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsLoading(true);

    const localAnswer = answerFromTripData(promptText, data);
    if (localAnswer) {
      window.setTimeout(() => {
        setMessages((prev) => [...prev, createAssistantMessage(localAnswer, "reisdata")]);
        setIsLoading(false);
      }, 250);
      return;
    }

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          tripDataContext: {
            overview: data.overview,
            timeline: data.timeline,
            countries: data.countries,
            accommodations: data.accommodations,
            flights: data.flights,
            camper: data.camper,
            documents: data.documents,
            hikes: data.hikes,
            savedLocations: data.savedLocations,
            budgetExpenses: data.budgetExpenses,
            categoryBudgets: data.categoryBudgets,
            packingItems: data.packingItems,
            checklists: data.checklists,
            family: data.familyMembers.map((member) => ({
              name: member.naam,
              role: member.rol,
              medicines: member.medicijnen,
              allergies: member.allergieen,
            })),
          },
        }),
      });

      if (!response.ok) throw new Error(`AI-service gaf status ${response.status}`);
      const resData = await response.json();
      const aiReply = resData.response || resData.error;
      if (!aiReply) throw new Error("Geen antwoord ontvangen");

      setMessages((prev) => [...prev, createAssistantMessage(aiReply, "online-ai")]);
    } catch {
      setMessages((prev) => [
        ...prev,
        createAssistantMessage(
          "Deze vraag kan ik niet rechtstreeks uit de opgeslagen reisgegevens beantwoorden en de online AI is nu niet bereikbaar. Controleer de internetverbinding en de AI-serverconfiguratie, of stel een vraag over de planning, vluchten, verblijven, documenten, het budget, de paklijst of checklist.",
          "reisdata"
        ),
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => setMessages([firstMessage]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/65 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[90vh] max-h-[820px]">
        <div className="bg-gradient-to-r from-[#174A7E] to-[#11667B] text-white px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-[#8EE4EC]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg truncate">AI Reisassistent</h3>
              <p className="text-xs sm:text-sm text-white/75 truncate">
                Antwoorden uit jullie eigen reisplanning, ook zonder AI-verbinding
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={resetChat}
              className="p-2 rounded-xl hover:bg-white/10 transition"
              title="Gesprek wissen"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition" title="Sluiten">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {presetQuestions.map(({ label, prompt, icon: Icon }) => (
              <button
                key={label}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="flex items-center justify-between gap-2 px-3 py-2.5 bg-white dark:bg-slate-800 hover:border-[#39B8C8] text-left rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition disabled:opacity-50"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Icon className="w-4 h-4 text-[#168CA0] shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{label}</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-[#FAF9F5] dark:bg-slate-950/60">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[92%] sm:max-w-[84%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                  msg.sender === "user" ? "bg-[#174A7E] text-white" : "bg-[#DDF5F7] text-[#11667B]"
                }`}
              >
                {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <div
                  className={`p-4 rounded-2xl text-sm leading-6 whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-[#174A7E] text-white rounded-tr-md"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-md shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
                <div className={`flex items-center gap-2 mt-1.5 px-1 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  {msg.sender === "assistant" && msg.source && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                      <CheckCircle2 className="w-3 h-3" />
                      {msg.source === "reisdata" ? "Eigen reisdata" : "Online AI"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="w-9 h-9 rounded-2xl bg-[#DDF5F7] text-[#11667B] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2 shadow-sm">
                <RefreshCw className="w-4 h-4 animate-spin text-[#168CA0]" />
                <span>Reisgegevens worden nagekeken…</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
          className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-end gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus-within:border-[#39B8C8] px-3 py-2">
            <Compass className="w-5 h-5 text-slate-400 mb-2 shrink-0" />
            <textarea
              value={inputPrompt}
              onChange={(event) => setInputPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Vraag iets over jullie reis…"
              rows={1}
              className="flex-1 resize-none bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm py-2 max-h-28 focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="p-2.5 bg-[#174A7E] hover:bg-[#1d5c9c] text-white rounded-xl disabled:opacity-40 transition shrink-0"
              title="Versturen"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 px-1">
            Praktische antwoorden komen uit lokaal opgeslagen reisdata. Controleer belangrijke boekings- en gezondheidsinformatie altijd bij de originele bron.
          </p>
        </form>
      </div>
    </div>
  );
};

import * as XLSX from "xlsx";
import {
  Accommodation,
  ActivityItem,
  CategoryBudget,
  ChecklistItem,
  CountryPlan,
  DocumentItem,
  ExpenseItem,
  Flight,
  GPSLocation,
  SavedLocation,
  TimelineDay,
  TripDataState,
  PackingItem,
  CarRentalDetails,
  BudgetDashboardData,
} from "../types";

type Row = Record<string, unknown>;

export interface ExcelImportPreview {
  fileName: string;
  sheets: string[];
  timeline: TimelineDay[];
  countries: CountryPlan[];
  accommodations: Accommodation[];
  flights: Flight[];
  activities: ActivityItem[];
  savedLocations: SavedLocation[];
  checklists: ChecklistItem[];
  documents: DocumentItem[];
  budgetExpenses: ExpenseItem[];
  categoryBudgets: CategoryBudget[];
  packingItems: PackingItem[];
  carRentals: CarRentalDetails[];
  budgetDashboard: BudgetDashboardData;
  warnings: string[];
  detailSheets: string[];
}

const normalize = (value: unknown) => String(value ?? "").trim();
const compact = (value: unknown) => normalize(value).toLowerCase().replace(/[^a-z0-9]+/g, "");
const yes = (value: unknown) => ["ja", "yes", "x", "betaald", "geboekt", "klaar", "done"].includes(normalize(value).toLowerCase());
const numberValue = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(normalize(value).replace(/[^0-9,.-]/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const excelDateToIso = (value: unknown): string => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`;
  }
  const text = normalize(value);
  if (!text) return "";
  const match = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (match) {
    const year = Number(match[3]) < 100 ? 2000 + Number(match[3]) : Number(match[3]);
    return `${year}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString().slice(0, 10);
};

const rowValue = (row: Row, aliases: string[]): unknown => {
  const entries = Object.entries(row);
  for (const alias of aliases) {
    const found = entries.find(([header]) => compact(header) === compact(alias));
    if (found) return found[1];
  }
  return undefined;
};

const rowsFromSheet = (workbook: XLSX.WorkBook, sheetName: string, header = 0): Row[] => {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<Row>(sheet, { defval: "", raw: true, range: header });
};

const detectHeaderRow = (workbook: XLSX.WorkBook, sheetName: string, requiredHeaders: string[]): number => {
  const rows = rawRows(workbook, sheetName);
  const wanted = requiredHeaders.map(compact);
  const index = rows.findIndex((row) => {
    const headers = row.map(compact);
    return wanted.every((required) => headers.some((header) => header === required || header.includes(required)));
  });
  return index >= 0 ? index : 0;
};

const rawRows = (workbook: XLSX.WorkBook, sheetName: string): unknown[][] => {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: true });
};

const findSheet = (sheetNames: string[], exactOrAliases: string[]): string | undefined =>
  sheetNames.find((name) => exactOrAliases.some((candidate) => compact(name) === compact(candidate))) ||
  sheetNames.find((name) => exactOrAliases.some((candidate) => compact(name).includes(compact(candidate))));

const countryForDate = (date: string): string => {
  if (date <= "2026-10-16") return "Verenigde Staten";
  if (date <= "2026-10-26") return "Fiji";
  if (date <= "2026-12-13") return "Australië";
  if (date <= "2027-01-21") return "Nieuw-Zeeland";
  if (date <= "2027-01-25") return "Singapore";
  if (date <= "2027-02-11") return "Thailand";
  if (date <= "2027-02-13") return "Qatar";
  if (date <= "2027-02-23") return "Tanzania";
  return "Onbekend";
};

const FLAG: Record<string, string> = {
  "Verenigde Staten": "🇺🇸", Fiji: "🇫🇯", Australië: "🇦🇺", "Nieuw-Zeeland": "🇳🇿",
  Singapore: "🇸🇬", Thailand: "🇹🇭", Qatar: "🇶🇦", Tanzania: "🇹🇿", Onbekend: "🌍",
};

const COORDS: Array<[RegExp, number, number]> = [
  [/san francisco/i, 37.7749, -122.4194], [/monterey|carmel/i, 36.6002, -121.8947], [/san simeon/i, 35.6439, -121.1893],
  [/santa barbara|buellton/i, 34.4208, -119.6982], [/los angeles|venice|anaheim|marina del rey/i, 34.0522, -118.2437],
  [/kingman/i, 35.1894, -114.053], [/grand canyon/i, 36.1069, -112.1129], [/kayenta|monument valley|bluff/i, 36.7278, -110.2546],
  [/kanab/i, 37.0475, -112.5263], [/bryce/i, 37.6283, -112.1677], [/zion|virgin/i, 37.2982, -113.0263],
  [/las vegas/i, 36.1699, -115.1398], [/mammoth/i, 37.6485, -118.9721], [/yosemite/i, 37.8651, -119.5383],
  [/nadi|fiji/i, -17.7765, 177.4356], [/brisbane/i, -27.4698, 153.0251], [/byron/i, -28.6474, 153.602],
  [/springbrook/i, -28.1916, 153.2706], [/rainbow beach/i, -25.904, 153.091], [/noosa/i, -26.388, 153.09],
  [/port douglas/i, -16.4837, 145.465], [/cape trib/i, -16.0836, 145.461], [/cairns/i, -16.9186, 145.7781],
  [/sydney/i, -33.8688, 151.2093], [/narooma/i, -36.218, 150.132], [/wilsons prom/i, -39.03, 146.32],
  [/melbourne/i, -37.8136, 144.9631], [/christchurch/i, -43.5321, 172.6362], [/tekapo/i, -44.0047, 170.4771],
  [/mount cook|aoraki/i, -43.595, 170.142], [/te anau/i, -45.4145, 167.718], [/queenstown/i, -45.0312, 168.6626],
  [/wanaka/i, -44.696, 169.136], [/franz josef/i, -43.3896, 170.1842], [/punakaiki/i, -42.114, 171.326],
  [/abel tasman|marahau/i, -40.965, 173.027], [/wellington/i, -41.2866, 174.7756], [/waitomo/i, -38.2607, 175.104],
  [/taupo/i, -38.6857, 176.0702], [/rotorua/i, -38.1368, 176.2497], [/auckland/i, -36.8509, 174.7645],
  [/singapore/i, 1.3521, 103.8198], [/phuket/i, 7.8804, 98.3923], [/khao lak/i, 8.65, 98.25], [/khao sok/i, 8.91, 98.53],
  [/koh lanta/i, 7.624, 99.079], [/ao nang|railay/i, 8.032, 98.822], [/doha/i, 25.2854, 51.531],
  [/arusha/i, -3.3869, 36.683], [/tarangire/i, -3.833, 36.0], [/ndutu/i, -2.99, 34.99], [/ngorongoro|karatu/i, -3.24, 35.49],
  [/kilimanjaro/i, -3.0674, 37.3556],
];

const gpsFor = (text: string): GPSLocation => {
  const found = COORDS.find(([pattern]) => pattern.test(text));
  return found ? { lat: found[1], lng: found[2], label: text } : { lat: 0, lng: 0, label: text };
};

const placeFromRoute = (value: unknown): string => {
  const text = normalize(value).replace(/[✈️🚐🚗]/g, "").replace(/\b\d{1,2}:\d{2}\b/g, "").trim();
  if (!text) return "Nog invullen";
  const parts = text.split(/→|➔|>|–|—/).map((part) => part.trim()).filter(Boolean);
  return (parts.at(-1) || text).replace(/\([^)]*route[^)]*\)/i, "").trim();
};

function parseGlobalPlanning(workbook: XLSX.WorkBook, warnings: string[]) {
  const sheetName = findSheet(workbook.SheetNames, ["Planning simpel"]);
  if (!sheetName) {
    warnings.push("Het vaste tabblad ‘Planning simpel’ ontbreekt.");
    return { timeline: [] as TimelineDay[], sourceRows: [] as Row[] };
  }
  const rows = rowsFromSheet(workbook, sheetName);
  const sourceRows: Row[] = [];
  const timeline = rows.flatMap((row, index) => {
    const date = excelDateToIso(rowValue(row, ["Datum"]));
    const route = normalize(rowValue(row, ["Locatie"]));
    if (!date || !route) return [];
    sourceRows.push(row);
    const place = placeFromRoute(route);
    const transport = normalize(rowValue(row, ["Vervoer"]));
    const km = numberValue(rowValue(row, ["KM"]));
    const duration = normalize(rowValue(row, ["duur", "Reistijd"]));
    const booking = normalize(rowValue(row, ["Geboekt"]));
    const cancel = normalize(rowValue(row, ["Annuleren"]));
    const paid = normalize(rowValue(row, ["Betaald"]));
    const bookedAt = normalize(rowValue(row, ["Geboekt bij"]));
    const facilities = [
      normalize(rowValue(row, ["Ontbijt"])) && `Ontbijt: ${normalize(rowValue(row, ["Ontbijt"]))}`,
      normalize(rowValue(row, ["Keuken"])) && `Keuken: ${normalize(rowValue(row, ["Keuken"]))}`,
      normalize(rowValue(row, ["Zwembad"])) && `Zwembad: ${normalize(rowValue(row, ["Zwembad"]))}`,
    ].filter(Boolean);
    const activities = [
      transport && `${transport}${km ? ` · ${km} km` : ""}${duration ? ` · ${duration} uur` : ""}`,
    ].filter(Boolean) as string[];
    const notes = [route, booking && `Geboekt: ${booking}`, cancel && `Annuleerbaar: ${cancel}`, paid && `Betaald: ${paid}`, bookedAt && `Via: ${bookedAt}`, ...facilities].filter(Boolean).join("\n");
    return [{
      id: `excel-day-${date}`,
      dayNumber: numberValue(rowValue(row, ["aantal dagen", "Dag"])) || index + 1,
      date,
      land: countryForDate(date),
      plaats: place,
      overnachting: normalize(rowValue(row, ["Naam"])) || "Nog invullen",
      activiteiten: activities,
      fotos: [],
      notities: notes,
      uitgaven: [],
      gps: gpsFor(`${route} ${place}`),
      isCompleted: false,
    } satisfies TimelineDay];
  });
  return { timeline: timeline.sort((a, b) => a.date.localeCompare(b.date)), sourceRows };
}

const detailCountry = (sheetName: string): string[] => {
  const n = compact(sheetName);
  if (n.includes("usa")) return ["Verenigde Staten"];
  if (n.includes("fiji")) return ["Fiji"];
  if (n.includes("brisbane") || n.includes("fnq") || n.includes("sydneymtmaced")) return ["Australië"];
  if (n.includes("nieuwzeeland")) return ["Nieuw-Zeeland"];
  if (n.includes("thailand")) return ["Thailand"];
  if (n.includes("singaporeendoha")) return ["Singapore", "Qatar"];
  if (n.includes("tanzania")) return ["Tanzania"];
  return [];
};

function mergeDetailPlanning(workbook: XLSX.WorkBook, timeline: TimelineDay[], warnings: string[]): string[] {
  const detailSheets = workbook.SheetNames.filter((name) => compact(name).startsWith("dagplanning"));
  const byDate = new Map(timeline.map((day) => [day.date, day]));
  for (const sheetName of detailSheets) {
    const headerRow = detectHeaderRow(workbook, sheetName, ["Datum", "Route", "Beschrijving"]);
    const rows = rowsFromSheet(workbook, sheetName, headerRow);
    const countries = detailCountry(sheetName);
    const candidates = timeline.filter((day) => countries.includes(day.land));
    let matched = 0;
    rows.forEach((row) => {
      let date = excelDateToIso(rowValue(row, ["Datum"]));
      const dayNumber = numberValue(rowValue(row, ["Dag"]));
      const route = normalize(rowValue(row, ["Route", "Plaats"]));
      const description = normalize(rowValue(row, ["Beschrijving", "Activiteit"]));
      const distance = normalize(rowValue(row, ["Afstand"]));
      const travelTime = normalize(rowValue(row, ["Reistijd"]));
      const info = normalize(rowValue(row, ["informatie", "Notities"]));
      if (!date && dayNumber) {
        const candidate = candidates[dayNumber - 1];
        if (candidate) date = candidate.date;
      }
      const day = date ? byDate.get(date) : undefined;
      if (!day || (!route && !description && !info)) return;
      const additions = [description, distance && `Afstand: ${distance}`, travelTime && `Reistijd: ${travelTime}`, info && `Informatie: ${info}`].filter(Boolean);
      day.activiteiten = Array.from(new Set([...day.activiteiten, ...additions]));
      day.notities = [day.notities, route && `Dagprogramma: ${route}`].filter(Boolean).join("\n");
      if (day.gps.lat === 0 && route) day.gps = gpsFor(route);
      matched += 1;
    });
    if (!matched) warnings.push(`Geen regels uit ‘${sheetName}’ konden aan een reisdag worden gekoppeld.`);
  }
  return detailSheets;
}

function parseAccommodations(timeline: TimelineDay[], sourceRows: Row[]): Accommodation[] {
  const grouped: Accommodation[] = [];
  let start = 0;
  while (start < timeline.length) {
    const name = timeline[start].overnachting;
    let end = start;
    while (end + 1 < timeline.length && timeline[end + 1].overnachting === name) end += 1;
    if (name && name !== "Nog invullen") {
      const rows = sourceRows.slice(start, end + 1);
      const total = rows.reduce((sum, row) => sum + numberValue(rowValue(row, ["Kosten"])), 0);
      const bookedAt = normalize(rowValue(rows[0] || {}, ["Geboekt bij"]));
      const paid = normalize(rowValue(rows[0] || {}, ["Betaald"]));
      const cancel = normalize(rowValue(rows[0] || {}, ["Annuleren"]));
      const isUrl = /^https?:\/\//i.test(name);
      grouped.push({
        id: `excel-accommodation-${grouped.length + 1}`,
        name: isUrl ? `Verblijf ${timeline[start].plaats}` : name,
        foto: "",
        adres: isUrl ? "" : (name.includes(",") ? name : ""),
        telefoon: "",
        email: "",
        checkIn: timeline[start].date,
        checkOut: end + 1 < timeline.length ? timeline[end + 1].date : timeline[end].date,
        prijsEur: total,
        boekingsnummer: "",
        mapsUrl: isUrl ? name : "",
        wifiCode: "",
        bijzonderheden: [`Via: ${bookedAt || "onbekend"}`, `Betaald: ${paid || "onbekend"}`, `Annuleerbaar: ${cancel || "onbekend"}`].join(" · "),
        land: timeline[start].land,
        stad: timeline[start].plaats,
      });
    }
    start = end + 1;
  }
  return grouped;
}

function parseFlights(workbook: XLSX.WorkBook, warnings: string[]): { flights: Flight[]; carRentals: CarRentalDetails[]; expenses: ExpenseItem[] } {
  const sheetName = findSheet(workbook.SheetNames, ["Vluchten en vervoer"]);
  if (!sheetName) return { flights: [], carRentals: [], expenses: [] };
  const rows = rawRows(workbook, sheetName);

  type Block = { title: string; headers: string[]; rows: unknown[][] };
  const blocks: Block[] = [];
  let currentTitle = "";
  let current: Block | null = null;
  const isHeaderRow = (row: unknown[]) => {
    const keys = row.map(compact);
    return keys.some((key) => key.includes("datum")) && keys.filter(Boolean).length >= 3;
  };

  rows.forEach((row) => {
    const nonEmpty = row.map(normalize).filter(Boolean);
    if (nonEmpty.length === 1 && !isHeaderRow(row)) {
      currentTitle = nonEmpty[0];
      current = null;
      return;
    }
    if (isHeaderRow(row)) {
      current = { title: currentTitle, headers: row.map((cell, i) => normalize(cell) || `col${i}`), rows: [] };
      blocks.push(current);
      return;
    }
    if (current && row.some((cell) => normalize(cell) !== "")) current.rows.push(row);
  });

  const flights: Flight[] = [];
  const carRentals: CarRentalDetails[] = [];
  const expenses: ExpenseItem[] = [];
  let flightCounter = 0;
  let rentalCounter = 0;
  let expenseCounter = 0;

  blocks.forEach((block) => {
    const dataRows: Row[] = block.rows.map((values) => Object.fromEntries(block.headers.map((header, i) => [header, values[i]])));
    const headerKeys = block.headers.map(compact);
    const isRentalBlock = headerKeys.some((h) => h.includes("ophaaldatum")) || compact(block.title).includes("autoencamperhuur");
    const isFlightBlock = !isRentalBlock && (
      (headerKeys.some((h) => h === "van") && headerKeys.some((h) => h === "naar")) ||
      compact(block.title).includes("vliegtickets")
    );

    if (isFlightBlock) {
      dataRows.forEach((row) => {
        const date = excelDateToIso(rowValue(row, ["Vertrek datum", "Datum", "reis datum vertrek"]));
        const from = normalize(rowValue(row, ["Van", "Vertrek locatie", "Ophaal locatie"]));
        const to = normalize(rowValue(row, ["Naar", "Aankomst locatie", "Inlever locatie"]));
        if (!date || !from || !to) return;
        const flightNumberRaw = normalize(rowValue(row, ["Vlucht Nummer", "Vlucht nummer", "Vluchtnummer"]));
        const flightMatch = flightNumberRaw.match(/\b([A-Z]{2,3})\s?([0-9]{2,4})\b/i);
        const airline = flightMatch?.[1]?.toUpperCase() || "Nog invullen";
        const flightNumber = flightMatch ? `${flightMatch[1].toUpperCase()} ${flightMatch[2]}` : (flightNumberRaw || "Nog invullen");
        flightCounter += 1;
        flights.push({
          id: `excel-flight-${flightCounter}`,
          airline,
          flightNumber,
          fromCity: from,
          fromCode: "",
          toCity: to.replace(/\)$/g, ""),
          toCode: "",
          departureTime: normalize(rowValue(row, ["Vertrek tijd", "Vertrektijd"])) || "Nog invullen",
          arrivalTime: normalize(rowValue(row, ["Aankomst tijd", "Aankomst rijd", "Aankomsttijd"])) || "Nog invullen",
          departureDate: date,
          terminal: "",
          gate: "",
          seat: normalize(rowValue(row, ["Stoelen", "Stoel"])),
          baggage: "",
          qrCodeText: "",
          status: "Op tijd",
          delayMinutes: 0,
        });
        const amount = numberValue(rowValue(row, ["Kosten"]));
        if (amount) {
          expenseCounter += 1;
          expenses.push({ id: `excel-flight-expense-${expenseCounter}`, date, category: "vluchten", description: `Vlucht ${from} → ${to}`, amountOriginal: amount, currency: "EUR", amountEur: amount, country: countryForDate(date), paidBy: "Gezin" });
        }
      });
      return;
    }

    if (isRentalBlock) {
      dataRows.forEach((row) => {
        const pickupDate = excelDateToIso(rowValue(row, ["Ophaal datum"]));
        const pickupLocation = normalize(rowValue(row, ["Ophaal locatie"]));
        const returnLocation = normalize(rowValue(row, ["Inlever locatie"]));
        const amount = numberValue(rowValue(row, ["Kosten"]));
        const reservation = normalize(rowValue(row, ["Reserverings nummer", "Reserveringsnummer"]));
        const extra = normalize(rowValue(row, ["overige", "Gegevens"]));
        if (!pickupLocation && !returnLocation && !amount) return;
        rentalCounter += 1;
        carRentals.push({
          modelName: extra || `Huurauto ${pickupLocation || rentalCounter}`,
          category: "Huurauto",
          company: "Nog invullen",
          ophaallocatie: pickupLocation || "Nog invullen",
          inleverlocatie: returnLocation || "Nog invullen",
          ophaaldatum: pickupDate,
          inleverdatum: excelDateToIso(rowValue(row, ["inlever datum", "Inleverdatum"])),
          dagprijsEur: amount,
          brandstofverbruikLPer100Km: 0,
          verzekeringInfo: reservation ? `Reserveringsnummer: ${reservation}` : "",
          kenteken: "",
          tolpasInbegrepen: false,
          kinderzitjesInbegrepen: false,
          hotelBudgetPerNachtEur: 0,
        });
        if (amount) {
          expenseCounter += 1;
          expenses.push({ id: `excel-rental-expense-${expenseCounter}`, date: pickupDate, category: "vervoer", description: `Huurauto ${pickupLocation} → ${returnLocation}`, amountOriginal: amount, currency: "EUR", amountEur: amount, country: pickupDate ? countryForDate(pickupDate) : "Onbekend", paidBy: "Gezin" });
        }
      });
      return;
    }

    dataRows.forEach((row) => {
      const amount = numberValue(rowValue(row, ["Kosten"]));
      if (!amount || Object.values(row).some((cell) => compact(cell) === "totaal")) return;
      const date = excelDateToIso(rowValue(row, ["reis datum vertrek", "Vertrek datum", "Datum"]));
      const from = normalize(rowValue(row, ["Vertrek locatie", "Van"]));
      const to = normalize(rowValue(row, ["Aankomst locatie", "Naar"]));
      expenseCounter += 1;
      expenses.push({ id: `excel-transport-expense-${expenseCounter}`, date, category: "vervoer", description: [block.title, from && `${from} → ${to}`].filter(Boolean).join(" · ") || "Overig vervoer", amountOriginal: amount, currency: "EUR", amountEur: amount, country: date ? countryForDate(date) : "Onbekend", paidBy: "Gezin" });
    });
  });

  if (!flights.length) warnings.push("Geen geldige vluchtregels gevonden in ‘Vluchten en vervoer’.");
  return { flights, carRentals, expenses };
}
function parseChecklist(workbook: XLSX.WorkBook): ChecklistItem[] {
  const sheetName = findSheet(workbook.SheetNames, ["To Do"]);
  if (!sheetName) return [];
  const rows = rowsFromSheet(workbook, sheetName);
  return rows.flatMap((row, index) => {
    const task = normalize(rowValue(row, ["Taak", "To-do", "Todo"]));
    if (!task) return [];
    const details = normalize(rowValue(row, ["Details/Notities", "Details", "Notities"]));
    const destination = normalize(rowValue(row, ["Bestemming", "Land"]));
    return [{
      id: `excel-check-${index + 1}`,
      text: details ? `${task} — ${details}` : task,
      category: destination ? "country-transition" : "pre-departure",
      countryScope: destination || undefined,
      completed: yes(rowValue(row, ["Status", "Status.1"])),
    } satisfies ChecklistItem];
  });
}

function parseInsurance(workbook: XLSX.WorkBook): DocumentItem[] {
  const sheetName = findSheet(workbook.SheetNames, ["Verzekeringen"]);
  if (!sheetName) return [];
  const rows = rawRows(workbook, sheetName);
  const documents: DocumentItem[] = [];
  rows.forEach((row, index) => {
    const title = normalize(row[0]);
    if (!title || compact(title).includes("typeverzekering") || compact(title) === "totaal" || compact(title).includes("kostenverzekeringen")) return;
    const amount = numberValue(row[1]);
    const provider = normalize(row[2]);
    documents.push({
      id: `excel-insurance-${index + 1}`,
      titel: title,
      categorie: "Verzekering",
      bestandsnaam: "",
      fileType: "pdf",
      uploadDatum: new Date().toISOString().slice(0, 10),
      notes: [provider && `Verzekeraar: ${provider}`, amount && `Kosten per maand: € ${amount.toFixed(2)}`].filter(Boolean).join(" · "),
    });
  });
  return documents;
}

// Normalises country-header text found in free-form sheets (e.g. "Nieuw Zeeland" without a
// hyphen) to the exact country strings used elsewhere in the app (from countryForDate/FLAG), so
// activities always match when views filter by land. Without this, a spelling difference makes
// a whole country's activities invisible in land-filtered views even though they did import.
const COUNTRY_NAME_ALIASES: Record<string, string> = {
  amerika: "Verenigde Staten",
  usa: "Verenigde Staten",
  "verenigde staten": "Verenigde Staten",
  fiji: "Fiji",
  australie: "Australië",
  "australië": "Australië",
  "nieuw zeeland": "Nieuw-Zeeland",
  "nieuw-zeeland": "Nieuw-Zeeland",
  singapore: "Singapore",
  thailand: "Thailand",
  qatar: "Qatar",
  tanzania: "Tanzania",
};
const normalizeCountryName = (value: string): string => COUNTRY_NAME_ALIASES[value.toLowerCase()] || value;


function parsePackingList(workbook: XLSX.WorkBook): PackingItem[] {
  const sheetName = findSheet(workbook.SheetNames, ["Paklijst"]);
  if (!sheetName) return [];
  const rows = rawRows(workbook, sheetName);
  const items: PackingItem[] = [];
  let assignee = "Gezamenlijk";
  let category: PackingItem["categorie"] = "Favorieten";

  const personHeadings: Record<string, string> = {
    man: "Bas",
    vrouw: "Maartje",
    "kledingkind10": "Liz",
    "kledingkind8": "Isa",
    "meiden810jaar": "Liz en Isa",
    "perpersoon": "Iedereen",
    gezamenlijk: "Gezamenlijk",
    ouders: "Bas en Maartje",
    kinderen: "Liz en Isa",
  };

  const categoryFor = (value: string): PackingItem["categorie"] | undefined => {
    const key = compact(value);
    if (/document|administratie|bagageverdeling|dagrugzak/.test(key)) return "Documenten";
    if (/elektronica/.test(key)) return "Elektronica";
    if (/ehbo|medicijn/.test(key)) return "EHBO";
    if (/toilettas|toilet/.test(key)) return "Toiletartikelen";
    if (/meiden|kind/.test(key)) return "Kinderen";
    if (/kleding|schoenen|man|vrouw/.test(key)) return "Kleding";
    if (/kamperen|overige|snorkel|strand/.test(key)) return "Kamperen";
    return undefined;
  };

  rows.forEach((row, index) => {
    const text = normalize(row[0]);
    if (!text) return;
    const key = compact(text);
    if (personHeadings[key]) {
      assignee = personHeadings[key];
      const nextCategory = categoryFor(text);
      if (nextCategory) category = nextCategory;
      return;
    }
    const isHeading = text === text.toUpperCase() || [
      "Kleding", "Schoenen", "Medicijnen", "Overige", "Gezamenlijk",
    ].includes(text);
    if (isHeading) {
      const nextCategory = categoryFor(text);
      if (nextCategory) category = nextCategory;
      return;
    }
    if (/^voor vertrek regelen$/i.test(text)) return;
    items.push({
      id: `excel-pack-${index + 1}`,
      item: text,
      categorie: category,
      status: "Inpakken",
      toegewezenAan: assignee,
    });
  });
  return items;
}

function parseActivities(workbook: XLSX.WorkBook): { activities: ActivityItem[]; savedLocations: SavedLocation[]; expenses: ExpenseItem[] } {
  const sheetName = workbook.SheetNames.find((name) => compact(name).startsWith("excursiesenactiv"));
  if (!sheetName) return { activities: [], savedLocations: [], expenses: [] };
  const rows = rawRows(workbook, sheetName);
  let currentCountry = "Onbekend";
  const activities: ActivityItem[] = [];
  const savedLocations: SavedLocation[] = [];
  const expenses: ExpenseItem[] = [];
  rows.slice(1).forEach((row, index) => {
    const name = normalize(row[0]);
    if (!name) return;
    const amount = numberValue(row[3]);
    const bought = normalize(row[4]);
    const address = normalize(row[5]);
    const website = normalize(row[6]);
    if (!amount && !address && !website && Object.prototype.hasOwnProperty.call(COUNTRY_NAME_ALIASES, name.toLowerCase())) {
      currentCountry = normalizeCountryName(name);
      return;
    }
    activities.push({ id: `excel-activity-${index + 1}`, name, land: currentCountry, location: address, ticketsUrl: website || undefined, bookingRef: bought, openingHours: "", priceEur: amount, rating: 0, photos: [], kidFriendlyScore: 3, durationHours: 0, description: bought ? `Al gekocht: ${bought}` : "" });
    if (address || website) savedLocations.push({ id: `excel-location-${index + 1}`, naam: name, adres: address, website: website || undefined, gps: gpsFor(`${name} ${address}`), kostenEur: amount || undefined, notities: bought ? `Al gekocht: ${bought}` : "", rating: 0, category: "sight" });
    if (amount && yes(bought)) expenses.push({ id: `excel-activity-expense-${index + 1}`, date: "", category: "activiteiten", description: name, amountOriginal: amount, currency: "EUR", amountEur: amount, country: currentCountry, paidBy: "Gezin" });
  });
  return { activities, savedLocations, expenses };
}

// Sums a "totals per country" side-table (e.g. Land | Aantal dagen | Dagbudget | Totaal per
// land) that a plain label/amount scan can't read because the row label is a country name, not
// a recognisable category keyword. Finds the "Totaal per land" header, then reads the adjacent
// country-name column downward, stopping as soon as that column goes blank so it never wanders
// into an unrelated table further down the sheet that happens to reuse the same columns.
function sumTotalPerLandColumn(rows: unknown[][]): number {
  for (let i = 0; i < rows.length; i += 1) {
    const totalColIndex = rows[i].findIndex((cell) => compact(cell) === "totaalperland");
    if (totalColIndex < 0) continue;
    const landColIndex = totalColIndex - 3; // Land | Aantal dagen | Dagbudget | Totaal per land
    let sum = 0;
    for (let r = i + 1; r < rows.length; r += 1) {
      const land = normalize(rows[r][landColIndex]);
      if (!land) break;
      sum += numberValue(rows[r][totalColIndex]);
    }
    return sum;
  }
  return 0;
}

function parseBudget(workbook: XLSX.WorkBook, planningRows: Row[], flightExpenses: ExpenseItem[], activityExpenses: ExpenseItem[]) {
  const sheetName = findSheet(workbook.SheetNames, ["Budget"]);
  const rows = sheetName ? rawRows(workbook, sheetName) : [];

  const amountRightOf = (label: RegExp, startCol = 0, endCol = 15): number => {
    for (const row of rows) {
      for (let c = startCol; c <= Math.min(endCol, row.length - 1); c += 1) {
        if (typeof row[c] !== "string" || !label.test(normalize(row[c]))) continue;
        for (let i = c + 1; i <= Math.min(endCol, row.length - 1); i += 1) {
          const amount = numberValue(row[i]);
          if (amount || row[i] === 0) return amount;
        }
      }
    }
    return 0;
  };

  const linesBetween = (labelCol: number, amountCol: number, startRow: number, endRow: number, source: string) => {
    const result: { label: string; amountEur: number; source: string }[] = [];
    for (let r = startRow; r <= Math.min(endRow, rows.length - 1); r += 1) {
      const label = normalize(rows[r]?.[labelCol]);
      const amount = numberValue(rows[r]?.[amountCol]);
      if (!label || /^totaal$/i.test(label)) continue;
      if (amount || rows[r]?.[amountCol] === 0) result.push({ label, amountEur: amount, source });
    }
    return result;
  };

  const countryDailyBudgets: BudgetDashboardData["countryDailyBudgets"] = [];
  for (let r = 3; r <= 13 && r < rows.length; r += 1) {
    const country = normalize(rows[r]?.[9]);
    const days = numberValue(rows[r]?.[10]);
    const dailyBudgetEur = numberValue(rows[r]?.[11]);
    const totalEur = numberValue(rows[r]?.[12]);
    if (!country || /totaal|accomodatie|excursies/i.test(country)) continue;
    if (days || dailyBudgetEur || totalEur) countryDailyBudgets.push({ country, days, dailyBudgetEur, totalEur });
  }

  const homeCostsEur = amountRightOf(/^Kosten van thuis$/i, 0, 2);
  const upfrontCostsEur = amountRightOf(/^Kosten vooraf$/i, 0, 2);
  const travelCostsEur = amountRightOf(/^Kosten op reis$/i, 0, 2);
  const contingencyEur = amountRightOf(/^Onvoorzien$/i, 0, 2);
  const totalNeededEur = amountRightOf(/^Totaal benodigd$/i, 0, 2);
  const alreadyPaidEur = amountRightOf(/^Totaal al betaald$/i, 0, 2);
  const fundingLines = linesBetween(0, 1, 13, 17, "Budget!A:B");
  const fundingTotalEur = amountRightOf(/^Totaal$/i, 0, 2) || fundingLines.reduce((sum, line) => sum + line.amountEur, 0);
  const incomeLines = linesBetween(14, 15, 2, 21, "Budget!O:P").filter((line) => !/totaal|aantal maanden/i.test(line.label));
  const monthlyIncomeEur = amountRightOf(/^Totaal per maand$/i, 14, 15) || incomeLines.reduce((sum, line) => sum + line.amountEur, 0);

  const accommodationBudget = amountRightOf(/kosten cabin\/hotel/i, 9, 13) || amountRightOf(/^Accomodatie$/i, 0, 2);
  const foodBudget = countryDailyBudgets.reduce((sum, item) => sum + item.totalEur, 0) + amountRightOf(/Uit eten extra/i, 9, 13);
  const activityBudget = amountRightOf(/Excursies \(gepland\)/i, 9, 13) + amountRightOf(/Excursies \(niet gepland\)/i, 9, 13);
  const flightBudget = amountRightOf(/^Vliegtickets$/i, 6, 8);
  const transportBudget = amountRightOf(/^Auto huur$/i, 6, 8) + amountRightOf(/^Overig vervoer$/i, 6, 8);
  const fuelBudget = amountRightOf(/Benzine/i, 6, 8);
  const insuranceBudget = amountRightOf(/Woonhuis \/ reis verzekering/i, 3, 5) * (amountRightOf(/Aantal maanden op reis/i, 3, 5) || 1) + amountRightOf(/Annulerings verzekering/i, 6, 8);
  const visaBudget = amountRightOf(/^Visa/i, 6, 8);
  const preparationBudget = amountRightOf(/^Vaccinaties$/i, 6, 8) + amountRightOf(/^Uitrusting$/i, 6, 8);

  const categoryValues: Array<[ExpenseItem["category"], string, number, string]> = [
    ["thuis", "Kosten thuis tijdens reis", homeCostsEur, "Home"],
    ["vluchten", "Vliegtickets", flightBudget, "Plane"],
    ["vervoer", "Auto, camper & overig vervoer", transportBudget, "Car"],
    ["brandstof", "Brandstof", fuelBudget, "Fuel"],
    ["hotels", "Accommodaties", accommodationBudget, "Hotel"],
    ["boodschappen", "Maaltijden & boodschappen", foodBudget, "ShoppingCart"],
    ["activiteiten", "Excursies & activiteiten", activityBudget, "Ticket"],
    ["verzekeringen", "Verzekeringen", insuranceBudget, "Shield"],
    ["visa", "Visa & reisdocumenten", visaBudget, "FileText"],
    ["overig", "Uitrusting & voorbereiding", preparationBudget, "Luggage"],
    ["onvoorzien", "Onvoorzien", contingencyEur, "CircleAlert"],
  ];

  const accommodationExpenses: ExpenseItem[] = planningRows.flatMap((row, index) => {
    const amount = numberValue(rowValue(row, ["Kosten"]));
    if (!amount || !yes(rowValue(row, ["Betaald"]))) return [];
    const date = excelDateToIso(rowValue(row, ["Datum"]));
    return [{ id: `excel-hotel-expense-${index + 1}`, date, category: "hotels", description: normalize(rowValue(row, ["Naam"])) || "Accommodatie", amountOriginal: amount, currency: "EUR", amountEur: amount, country: countryForDate(date), paidBy: "Gezin" } satisfies ExpenseItem];
  });
  const expenses = [...accommodationExpenses, ...flightExpenses, ...activityExpenses];
  const categoryBudgets: CategoryBudget[] = categoryValues
    .filter(([, , budget]) => budget > 0)
    .map(([category, label, budgetEur, iconName]) => ({ category, label, budgetEur, spentEur: expenses.filter((item) => item.category === category).reduce((sum, item) => sum + item.amountEur, 0), iconName }));

  const budgetDashboard: BudgetDashboardData = {
    homeCostsEur,
    upfrontCostsEur,
    travelCostsEur,
    contingencyEur,
    totalNeededEur,
    alreadyPaidEur,
    fundingTotalEur,
    fundingLines,
    monthlyIncomeEur,
    incomeLines,
    countryDailyBudgets,
    sourceSheet: sheetName || "Budget",
  };

  return { expenses, categoryBudgets, budgetDashboard };
}
function buildCountries(timeline: TimelineDay[]): CountryPlan[] {
  const order: string[] = [];
  timeline.forEach((day) => { if (!order.includes(day.land)) order.push(day.land); });
  return order.map((land, index) => {
    const days = timeline.filter((day) => day.land === land);
    const cities = Array.from(new Set(days.map((day) => day.plaats).filter(Boolean)));
    const coordDay = days.find((day) => day.gps.lat !== 0) || days[0];
    return { id: `excel-country-${index + 1}`, land, flag: FLAG[land] || "🌍", startDate: days[0]?.date || "", endDate: days.at(-1)?.date || "", routeDescription: cities.join(" → "), mapCoordinates: coordDay?.gps || { lat: 0, lng: 0, label: land }, highlightCities: cities };
  });
}

export function createExcelImportPreview(workbook: XLSX.WorkBook, fileName: string): ExcelImportPreview {
  const warnings: string[] = [];
  const { timeline, sourceRows } = parseGlobalPlanning(workbook, warnings);
  const detailSheets = mergeDetailPlanning(workbook, timeline, warnings);
  const accommodations = parseAccommodations(timeline, sourceRows);
  const { flights, carRentals, expenses: flightExpenses } = parseFlights(workbook, warnings);
  const checklists = parseChecklist(workbook);
  const documents = parseInsurance(workbook);
  const { activities, savedLocations, expenses: activityExpenses } = parseActivities(workbook);
  const { expenses: budgetExpenses, categoryBudgets, budgetDashboard } = parseBudget(workbook, sourceRows, flightExpenses, activityExpenses);
  const packingItems = parsePackingList(workbook);
  const countries = buildCountries(timeline);
  if (!timeline.length) warnings.push("Geen geldige reisdagen gevonden in ‘Planning simpel’.");
  if (!detailSheets.length) warnings.push("Geen tabbladen gevonden waarvan de naam begint met ‘Dagplanning -’.");
  if (!flights.length) warnings.push("Geen vluchten gevonden in ‘Vluchten en vervoer’.");
  const missingGps = timeline.filter((day) => day.gps.lat === 0).length;
  if (missingGps) warnings.push(`${missingGps} reisdagen hebben nog geen herkende kaartcoördinaten.`);
  return { fileName, sheets: workbook.SheetNames, timeline, countries, accommodations, flights, activities, savedLocations, checklists, documents, budgetExpenses, categoryBudgets, packingItems, carRentals, budgetDashboard, warnings, detailSheets };
}

export function applyExcelImport(data: TripDataState, preview: ExcelImportPreview, replace: boolean): TripDataState {
  // Bij vervangen moet oude demo-inhoud ook verdwijnen wanneer een onderdeel leeg is.
  const merge = <T,>(current: T[], incoming: T[]) => replace ? incoming : [...current, ...incoming];
  const firstDay = preview.timeline[0];
  const lastDay = preview.timeline.at(-1);
  const totalKm = preview.timeline.reduce((sum, day) => {
    const match = day.activiteiten.join(" ").match(/([\d.]+)\s*km/i);
    return sum + (match ? Number(match[1]) : 0);
  }, 0);
  return {
    ...data,
    timeline: merge(data.timeline, preview.timeline),
    countries: merge(data.countries, preview.countries),
    accommodations: merge(data.accommodations, preview.accommodations),
    flights: merge(data.flights, preview.flights),
    activities: merge(data.activities, preview.activities),
    savedLocations: merge(data.savedLocations, preview.savedLocations),
    checklists: merge(data.checklists, preview.checklists),
    documents: merge(data.documents, preview.documents),
    budgetExpenses: merge(data.budgetExpenses, preview.budgetExpenses),
    categoryBudgets: replace ? preview.categoryBudgets : [...data.categoryBudgets, ...preview.categoryBudgets],
    budgetDashboard: preview.budgetDashboard,
    packingItems: merge(data.packingItems, preview.packingItems),
    camper: preview.carRentals.length ? {
      ...data.camper,
      activeOption: "auto",
      carOption: preview.carRentals[0],
      carRentals: replace ? preview.carRentals : [...(data.camper.carRentals || [data.camper.carOption]), ...preview.carRentals],
    } : (replace ? { ...data.camper, carOption: { modelName: "Nog invullen", category: "Huurauto", company: "Nog invullen", ophaallocatie: "", inleverlocatie: "", ophaaldatum: "", inleverdatum: "", dagprijsEur: 0, brandstofverbruikLPer100Km: 0, verzekeringInfo: "", tolpasInbegrepen: false, kinderzitjesInbegrepen: false, hotelBudgetPerNachtEur: 0 }, carRentals: [] } : data.camper),
    overview: firstDay ? {
      ...data.overview,
      title: "Wereldreis 2026–2027",
      familyTitle: "Familie Keiman–Marree",
      startDate: firstDay.date,
      endDate: lastDay?.date || data.overview.endDate,
      totalDays: preview.timeline.length,
      currentDay: 1,
      currentCountry: firstDay.land,
      currentCity: firstDay.plaats,
      currentGps: firstDay.gps,
      visitedCountriesCount: preview.countries.length,
      totalKmTraveled: totalKm,
      nextFlight: preview.flights[0] ? { ...data.overview.nextFlight, flightNumber: preview.flights[0].flightNumber, airline: preview.flights[0].airline, fromCode: preview.flights[0].fromCode || preview.flights[0].fromCity, toCode: preview.flights[0].toCode || preview.flights[0].toCity, departureTime: preview.flights[0].departureTime, gate: preview.flights[0].gate, seat: preview.flights[0].seat } : { flightNumber: "", airline: "", fromCode: "", toCode: "", departureTime: "", gate: "", seat: "", countdownText: "" },
    } : data.overview,
  };
}

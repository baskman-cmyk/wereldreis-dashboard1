import { TripDataState } from "../types";
import { initialTripData } from "../data/initialTripData";

const STORAGE_KEY = "WORLD_TRIP_DASHBOARD_DATA_V2";
const LEGACY_STORAGE_KEY = "WORLD_TRIP_DASHBOARD_DATA_V1";
const BACKUP_KEY = "WORLD_TRIP_DASHBOARD_DATA_BACKUP_V1";
const STORAGE_VERSION = 2;

interface StorageEnvelope {
  version: number;
  savedAt: string;
  data: TripDataState;
}

export interface StorageStatus {
  savedAt?: string;
  sizeBytes: number;
  hasRecoveryPoint: boolean;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

function mergeWithDefaults(parsed: Partial<TripDataState>): TripDataState {
  return {
    ...initialTripData,
    ...parsed,
    overview: {
      ...initialTripData.overview,
      ...(parsed.overview || {}),
    },
    camper: {
      ...initialTripData.camper,
      ...(parsed.camper || {}),
      carOption: {
        ...initialTripData.camper.carOption,
        ...(parsed.camper?.carOption || {}),
      },
      tankLevels: {
        ...initialTripData.camper.tankLevels,
        ...(parsed.camper?.tankLevels || {}),
      },
    },
    widgetsConfig:
      Array.isArray(parsed.widgetsConfig) && parsed.widgetsConfig.length > 0
        ? parsed.widgetsConfig.map((widget: any, index) => ({
            id: typeof widget?.id === "string" ? widget.id : `widget-${index + 1}`,
            title: typeof widget?.title === "string" ? widget.title : "Widget",
            enabled: widget?.enabled ?? true,
          }))
        : initialTripData.widgetsConfig,
  };
}

export function validateImportedTripData(value: unknown): TripDataState {
  const candidate = isObject(value) && isObject(value.data) ? value.data : value;
  if (!isObject(candidate)) {
    throw new Error("Het back-upbestand bevat geen geldige reisgegevens.");
  }

  if (!isObject(candidate.overview) || !Array.isArray(candidate.timeline)) {
    throw new Error("Verplichte onderdelen 'overview' en 'timeline' ontbreken.");
  }

  const overview = candidate.overview as Record<string, unknown>;
  if (typeof overview.title !== "string" || typeof overview.startDate !== "string") {
    throw new Error("De reisinformatie in dit bestand is onvolledig.");
  }

  return mergeWithDefaults(candidate as Partial<TripDataState>);
}

function parseStoredValue(raw: string): { data: TripDataState; savedAt?: string } {
  const parsed: unknown = JSON.parse(raw);
  if (isObject(parsed) && typeof parsed.version === "number" && "data" in parsed) {
    return {
      data: validateImportedTripData(parsed),
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : undefined,
    };
  }
  return { data: validateImportedTripData(parsed) };
}

export function loadTripData(): TripDataState {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) return parseStoredValue(current).data;

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const migrated = parseStoredValue(legacy).data;
      saveTripData(migrated);
      return migrated;
    }
  } catch (error) {
    console.error("Reisgegevens konden niet worden geladen:", error);
  }
  return initialTripData;
}

export function createRecoveryPoint(data: TripDataState): void {
  try {
    const envelope: StorageEnvelope = {
      version: STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      data,
    };
    localStorage.setItem(BACKUP_KEY, JSON.stringify(envelope));
  } catch (error) {
    console.error("Herstelpunt kon niet worden gemaakt:", error);
  }
}

export function restoreRecoveryPoint(currentData?: TripDataState): TripDataState | null {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    const restored = parseStoredValue(raw).data;
    if (currentData) createRecoveryPoint(currentData);
    saveTripData(restored);
    return restored;
  } catch (error) {
    console.error("Herstelpunt kon niet worden teruggezet:", error);
    return null;
  }
}

export function saveTripData(data: TripDataState): void {
  const envelope: StorageEnvelope = {
    version: STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    data,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch (error) {
    console.error("Reisgegevens konden niet lokaal worden opgeslagen:", error);
    window.dispatchEvent(new CustomEvent("wereldreis-storage-error"));
  }
}

export function getStorageStatus(): StorageStatus {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY) || "";
    const parsed = raw ? parseStoredValue(raw) : undefined;
    return {
      savedAt: parsed?.savedAt,
      sizeBytes: new Blob([raw]).size,
      hasRecoveryPoint: Boolean(localStorage.getItem(BACKUP_KEY)),
    };
  } catch {
    return { sizeBytes: 0, hasRecoveryPoint: Boolean(localStorage.getItem(BACKUP_KEY)) };
  }
}

export function resetTripData(): TripDataState {
  try {
    const current = loadTripData();
    createRecoveryPoint(current);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (error) {
    console.error(error);
  }
  return initialTripData;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const escapeXml = escapeHtml;

export function exportToJSON(data: TripDataState): void {
  const envelope: StorageEnvelope = {
    version: STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    data,
  };
  downloadBlob(
    new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json" }),
    `Wereldreis_Back-up_${new Date().toISOString().slice(0, 10)}.json`,
  );
}

export function exportBudgetToCSV(expenses: TripDataState["budgetExpenses"]): void {
  const cell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const headers = ["ID", "Datum", "Categorie", "Omschrijving", "BedragOrigineel", "Valuta", "BedragEUR", "Land", "BetaaldDoor"];
  const rows = expenses.map((expense) => [
    expense.id,
    expense.date,
    expense.category,
    expense.description,
    expense.amountOriginal,
    expense.currency,
    expense.amountEur.toFixed(2).replace(".", ","),
    expense.country,
    expense.paidBy,
  ]);
  const csv = "\uFEFF" + [headers, ...rows].map((row) => row.map(cell).join(";")).join("\r\n");
  downloadBlob(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
    `Wereldreis_Uitgaven_${new Date().toISOString().slice(0, 10)}.csv`,
  );
}

export function exportHikeToGPX(hike: TripDataState["hikes"][0]): void {
  const trackPoints = hike.gpsPoints
    .map((point) => `      <trkpt lat="${point.lat}" lon="${point.lng}">\n        <name>${escapeXml(point.label || hike.name)}</name>\n      </trkpt>`)
    .join("\n");
  const gpx = `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Wereldreis Dashboard">\n  <trk>\n    <name>${escapeXml(hike.name)} (${escapeXml(hike.land)})</name>\n    <desc>${escapeXml(hike.description)}</desc>\n    <trkseg>\n${trackPoints}\n    </trkseg>\n  </trk>\n</gpx>`;
  downloadBlob(new Blob([gpx], { type: "application/gpx+xml" }), `${hike.name.replace(/[^a-z0-9]+/gi, "_")}.gpx`);
}

export function exportTravelBookHTML(data: TripDataState): void {
  const title = escapeHtml(data.overview?.title || "Wereldreis");
  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${title} - Reisboek</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 40px; color: #174A7E; background: #FFF; line-height: 1.6; }
    h1 { border-bottom: 3px solid #39B8C8; padding-bottom: 10px; }
    h2 { color: #267f8d; margin-top: 30px; }
    .meta { background: #F3E7C8; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .day-card { border: 1px solid #E2E8F0; padding: 15px; margin-bottom: 15px; border-radius: 8px; page-break-inside: avoid; }
    .highlight { font-weight: bold; }
    @media print { body { margin: 18mm; } }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    <p><strong>Gezin:</strong> ${escapeHtml(data.overview.familyTitle)}</p>
    <p><strong>Reisperiode:</strong> ${escapeHtml(data.overview.startDate)} t/m ${escapeHtml(data.overview.endDate)} (${data.overview.totalDays} dagen)</p>
    <p><strong>Landen bezocht:</strong> ${data.overview.visitedCountriesCount} | <strong>Kilometers:</strong> ${data.overview.totalKmTraveled} km</p>
  </div>
  <h2>Dagboek &amp; hoogtepunten</h2>
  ${data.journals.map((journal) => `<article class="day-card"><h3>${escapeHtml(journal.datum)} - ${escapeHtml(journal.plaats)}, ${escapeHtml(journal.land)}</h3><p><strong>Hoogtepunt:</strong> ${escapeHtml(journal.hoogtepunt)}</p><p>${escapeHtml(journal.tekst).replace(/\n/g, "<br>")}</p><p class="highlight">Favoriete herinnering: ${escapeHtml(journal.favorieteHerinnering)}</p></article>`).join("")}
  <h2>Vluchten</h2>
  <ul>${data.flights.map((flight) => `<li>${escapeHtml(flight.departureDate)}: ${escapeHtml(flight.airline)} ${escapeHtml(flight.flightNumber)} (${escapeHtml(flight.fromCode)} &rarr; ${escapeHtml(flight.toCode)})</li>`).join("")}</ul>
  <h2>Camper &amp; route</h2>
  <p><strong>Campermodel:</strong> ${escapeHtml(data.camper.modelName)}</p>
  <p><strong>Verzekering:</strong> ${escapeHtml(data.camper.verzekeringInfo)}</p>
</body>
</html>`;
  downloadBlob(new Blob([html], { type: "text/html;charset=utf-8" }), `Reisboek_Wereldreis_${new Date().toISOString().slice(0, 10)}.html`);
}

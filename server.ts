import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const REQUEST_LIMIT = process.env.REQUEST_LIMIT || "2mb";
const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS || 30000);

app.disable("x-powered-by");
app.use(express.json({ limit: REQUEST_LIMIT }));

const apiKey = process.env.GEMINI_API_KEY?.trim();
const geminiModel = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
const aiConfigured = Boolean(apiKey);

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readRequiredString(body: unknown, field: string, maxLength: number): string {
  if (!isRecord(body) || typeof body[field] !== "string") {
    throw new RequestValidationError(`Veld '${field}' ontbreekt of is ongeldig.`);
  }
  const value = body[field].trim();
  if (!value) throw new RequestValidationError(`Veld '${field}' mag niet leeg zijn.`);
  if (value.length > maxLength) {
    throw new RequestValidationError(`Veld '${field}' is te lang (maximaal ${maxLength} tekens).`);
  }
  return value;
}

class RequestValidationError extends Error {}

async function generateGeminiText(
  prompt: string,
  options: { systemInstruction?: string; temperature?: number } = {},
): Promise<string> {
  if (!apiKey) throw new Error("GEMINI_API_KEY is niet geconfigureerd.");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        ...(options.systemInstruction
          ? { systemInstruction: { parts: [{ text: options.systemInstruction }] } }
          : {}),
        generationConfig: {
          ...(typeof options.temperature === "number" ? { temperature: options.temperature } : {}),
        },
      }),
    });

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new Error(payload.error?.message || `Gemini API-fout (${response.status}).`);
    }

    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();
    if (!text) throw new Error("Gemini gaf geen tekst terug.");
    return text;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("De AI-aanvraag duurde te lang en is afgebroken.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    aiConfigured,
    model: aiConfigured ? geminiModel : undefined,
    environment: IS_PRODUCTION ? "production" : "development",
  });
});

app.post("/api/ai/assistant", async (req, res, next) => {
  try {
    const prompt = readRequiredString(req.body, "prompt", 4000);
    const tripDataContext = isRecord(req.body) ? req.body.tripDataContext : undefined;

    if (!aiConfigured) {
      return res.json({
        response: "De online AI is niet geconfigureerd. Vragen over je eigen reisgegevens kunnen nog steeds lokaal in de app worden beantwoord.",
      });
    }

    const systemInstruction = `Je bent een praktische AI Reisassistent voor een gezin op wereldreis.
Gebruik uitsluitend de meegegeven reiscontext voor persoonlijke gegevens, boekingen, tijden, adressen, budgetten, documenten en gezondheid. Verzin niets wanneer informatie ontbreekt. Benoem dan duidelijk dat het niet in de app staat. Beantwoord vriendelijk, beknopt en in helder Nederlands. Maak onderscheid tussen een feit uit de reisdata en een algemene suggestie. Geef bij medische, juridische of visumvragen geen stellige conclusie en adviseer controle bij de officiële bron.`;

    const fullPrompt = `Reiscontext van het gezin:\n${JSON.stringify(tripDataContext || {}, null, 2)}\n\nVraag van de reisgenoot:\n${prompt}`;
    const text = await generateGeminiText(fullPrompt, { systemInstruction, temperature: 0.7 });
    return res.json({ response: text });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/ai/summarize-day", async (req, res, next) => {
  try {
    const dayData = isRecord(req.body) ? req.body.dayData : undefined;
    if (!dayData) throw new RequestValidationError("Daggegevens ontbreken.");
    if (!aiConfigured) {
      return res.json({ summary: `Mooie reisdag met waardevolle herinneringen voor het hele gezin.` });
    }
    const prompt = `Schrijf een sfeervolle, warme samenvatting in 3-4 zinnen van de volgende reisdag voor het gezinsdagboek:\n${JSON.stringify(dayData, null, 2)}`;
    const text = await generateGeminiText(prompt, { systemInstruction: "Je bent een gepassioneerde reisschrijver." });
    return res.json({ summary: text });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/ai/analyze-budget", async (req, res, next) => {
  try {
    const budgetSummary = isRecord(req.body) ? req.body.budgetSummary : undefined;
    if (!budgetSummary) throw new RequestValidationError("Budgetgegevens ontbreken.");
    if (!aiConfigured) {
      return res.json({ analysis: "De online budgetanalyse is niet geconfigureerd. De lokale budgetoverzichten blijven beschikbaar." });
    }
    const prompt = `Analyseer het volgende reisbudget en uitgavenpatroon voor een wereldreis van 5 maanden voor 4 personen:\n${JSON.stringify(budgetSummary, null, 2)}\nGeef 3 concrete inzichten en praktische bespaartips in het Nederlands.`;
    const text = await generateGeminiText(prompt);
    return res.json({ analysis: text });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/ai/generate-travelbook", async (req, res, next) => {
  try {
    if (!isRecord(req.body)) throw new RequestValidationError("Reisboekgegevens ontbreken.");
    const { journalEntries, highlights } = req.body;
    if (!aiConfigured) {
      return res.json({ travelBook: "# Ons wereldreisboek\n\nConfigureer de online AI om automatisch een volledig hoofdstuk te laten schrijven." });
    }
    const prompt = `Stel een warm en samenhangend hoofdstuk in Markdown samen op basis van deze dagboekaantekeningen en hoogtepunten:\n${JSON.stringify({ journalEntries, highlights }, null, 2)}`;
    const text = await generateGeminiText(prompt);
    return res.json({ travelBook: text });
  } catch (error) {
    return next(error);
  }
});

app.use("/api", (_req, res) => res.status(404).json({ error: "API-route niet gevonden." }));

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const validationError = error instanceof RequestValidationError;
  const message = error instanceof Error ? error.message : "Onbekende serverfout.";
  console.error("Serverfout:", error);
  res.status(validationError ? 400 : 500).json({
    error: validationError ? message : "De aanvraag kon niet worden verwerkt.",
    ...(!IS_PRODUCTION && !validationError ? { details: message } : {}),
  });
});

async function setupServer() {
  if (!IS_PRODUCTION) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { maxAge: "1h" }));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Wereldreis Dashboard draait op http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((error) => {
  console.error("Server kon niet starten:", error);
  process.exitCode = 1;
});

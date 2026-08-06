# Wereldreis Dashboard

Een lokale React/Vite-reisapp voor planning, reisdagen, vluchten, accommodaties, budget, documenten, foto’s, dagboek, paklijst, checklist, kaarten en een optionele Gemini-reisassistent.

## Installeren

Vereist: Node.js 20 of nieuwer.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open daarna `http://localhost:3000`.

Op Windows kun je `.env.example` handmatig kopiëren naar `.env.local`.

## AI instellen

De app kan zonder AI-sleutel worden gebruikt. Lokale antwoorden over ingevoerde reisgegevens blijven beschikbaar.

Zet voor online AI-functies in `.env.local`:

```env
GEMINI_API_KEY=jouw_sleutel
GEMINI_MODEL=gemini-2.5-flash
```

De sleutel blijft op de server en wordt niet naar de browser gestuurd.

## Controleren en bouwen

```bash
npm run typecheck
npm run build
npm start
```

`npm run clean` werkt op Windows, macOS en Linux.

## Gegevens en back-ups

Reisgegevens worden lokaal in de browser opgeslagen. Dit is geen cloudback-up.

Gebruik regelmatig **Meer → Export & back-up → JSON-back-up** en bewaar dat bestand ook buiten het apparaat. Voor import en reset maakt de app automatisch een lokaal herstelpunt.

## Belangrijkste onderdelen

- Vandaag: actuele reisdag, planning, verblijf, uitgaven, foto’s en dagboek.
- Dashboard: aftellen, volgende vlucht, accommodatie, taken en budget.
- Reisplanning en kaart: dag-tot-dag overzicht, GPS-punten, verblijven en bewaarde plekken.
- Budget: uitgaven, categorieën en landen.
- Documenten: geldigheid, gezinsfilters en lokale bestanden.
- Dagboek & foto’s: gekoppeld aan reisdatum en locatie.
- Paklijst & checklist: per persoon, fase, categorie en status.
- AI Reisassistent: lokale reisvragen en optionele online Gemini-antwoorden.
- Export: JSON, CSV, GPX en HTML-reisboek.

## Privacy

De app bewaart reisgegevens lokaal in de browser. Bestanden en gegevens zijn niet automatisch end-to-end versleuteld en worden niet automatisch gesynchroniseerd naar andere apparaten.

## Installeren als app (PWA)

Na een productiebuild kan het dashboard via een moderne browser op telefoon, tablet of computer als app worden geïnstalleerd. De app-shell en eerder geopende statische onderdelen blijven daarna offline beschikbaar. Reisgegevens blijven lokaal in dezelfde browseropslag staan.

Let op: online AI, actuele externe gegevens en nog niet eerder geladen onderdelen vereisen een internetverbinding. Maak daarnaast regelmatig een JSON-back-up; een geïnstalleerde webapp is geen cloudback-up.

## Releasecontrole

```bash
npm run verify:release
npm run check
```

De releasecontrole verifieert onder andere de appnaam, PWA-manifestbestanden en pictogrammen.

## Installeren als app

Na publicatie via HTTPS kan de app op een ondersteund apparaat worden geïnstalleerd. Open **Meer → Installeer de app**. Wanneer een nieuwe release klaarstaat, toont de app bovenaan een melding met **Nu bijwerken**.

## Releasecontrole

Voer vóór publicatie uit:

```bash
npm run verify:release
npm run check
```

De releasecontrole controleert onder andere de PWA-metadata, pictogramformaten, cacheversie, updateflow en oude placeholderteksten.


## Excel importeren
Open **Meer → Excel importeren**. De importer ondersteunt het eigen werkboek met de tabbladen `Planning simpel` en `To Do`, plus standaardtabbladen `Planning`, `Accommodaties` en `Vluchten`. Voor iedere import wordt automatisch een herstelpunt gemaakt.

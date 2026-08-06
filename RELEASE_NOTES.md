# Release 1.4.5

## Hersteld
- Vluchten worden nu gelezen uit de werkelijke kolommen `Vertrek datum`, `Vertrek tijd`, `Van`, `Naar`, `Aankomst datum`, `Aankomst tijd`, `Vlucht Nummer` en `Stoelen`.
- Bij vervangen verdwijnen oude voorbeeldvluchten ook wanneer het Excelbestand geen geldige vluchten bevat.
- Alle huurauto-/camperhuurregels uit `Vluchten en vervoer` worden geïmporteerd; de oude demo-huurauto wordt vervangen.
- Huurauto’s worden als afzonderlijke reserveringen weergegeven, ieder met eigen contract- en verzekerings-PDF.
- Budget heeft nu een dashboard dat de hoofdtotalen, bekostiging en dagbudgetten per land rechtstreeks uit het tabblad Budget toont.
- Uitgaven krijgen de juiste categorieën `vluchten` en `vervoer` in plaats van `overig`.

# Versie 1.4.4 – planning, budget en compacte lijsten

- Oude voorbeeldvluchten, activiteiten en andere lijsten worden bij **vervangen** echt leeggemaakt.
- Dagplanning-tabbladen met een extra titelregel worden correct herkend.
- Reisplanning toont reserveringsgegevens als visuele badges en laat het dagprogramma duidelijker zien.
- Landenoverzicht is compacter en rustiger.
- Budget toont de herkomst van cijfers en laat per categorie zien hoeveel bronregels meetellen.
- Paklijst en checklist zijn gegroepeerd en inklapbaar.
- De geïmporteerde reisnaam en gezinsnaam zijn aangepast naar Familie Keiman–Marree.

# Versie 1.4.3 – PDF-bijlagen

- PDF-upload, openen, downloaden en verwijderen bij accommodaties.
- PDF-upload bij vluchten en e-tickets.
- Huurcontract- en verzekerings-PDF bij autohuur.
- Verzekeringsgegevens en polis-PDF bij documenten.
- Ticket- en bevestigings-PDF bij activiteiten en excursies.
- Statische teksten over tolpas, kinderzitjes, wendbaarheid en zichtbaar autoverbruik verwijderd.
- PDF-bestanden worden lokaal in de browser opgeslagen, met een limiet van 4 MB per bestand.

## 1.3.0 – Excel-import

- Nieuw Importcentrum via Meer.
- Ondersteunt het eigen wereldreis-Excelbestand (Planning simpel en To Do).
- Herkent ook standaardtabbladen voor planning, accommodaties en vluchten.
- Voorvertoning met aantallen en waarschuwingen.
- Import kan vervangen of toevoegen; automatisch herstelpunt.

# Wereldreis Dashboard 1.2.0

## Nieuw

- Installatieknop op de pagina **Meer** wanneer de browser PWA-installatie ondersteunt.
- Herkenning wanneer de app al zelfstandig is geïnstalleerd.
- Zichtbare melding wanneer een nieuwe appversie klaarstaat.
- Gecontroleerd bijwerken via de wachtende serviceworker.
- Uitgebreide automatische releasecontrole.

## Controle

- PWA-manifest en appmetadata gecontroleerd.
- Pictogrammen gecontroleerd op 192×192 en 512×512 pixels.
- Serviceworker-cache gekoppeld aan versie 1.2.0.
- Zipstructuur en bronbestanden gecontroleerd.

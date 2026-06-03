# 🏃 Laufschuhe Tier List 2026

Interaktive Tier List mit 65+ Laufschuhen inkl. chinesischer Marken.

## Live
👉 https://filipsucic.github.io/laufschuhe-tierlist/

## Lokal bearbeiten
Einfach `index.html` im Browser öffnen – keine Dependencies, kein Build-Step.

## Struktur
```
index.html   ← Alles in einer Datei (HTML + CSS + JS + Daten)
README.md
```

## Schuhe hinzufügen
Im `<script>`-Block das `shoes`-Objekt erweitern:
```js
"schuh-id": {
  name: "Name", brand: "Marke", tier: "A", tierColor: "#c8991a",
  use: {race: true, train: false},
  raceNote: "...", trainNote: "...",
  badges: [{text:"NEU", cls:"badge-new"}],
  value: 4,          // 1–5 Preis-Leistung
  valueVerdict: "Begründung",
  valueBreakdown: [{label:"Preis", val:"~200 €"}, ...],
  specs: [{label:"Gewicht", value:"190 g"}, ...],
  athletes: [{flag:"🇰🇪", name:"Name", dist:"Marathon", result:"2:02:00", note:"..."}],
  desc: "Beschreibung"
}
```
Dann im HTML eine Karte in der passenden Tier-Row hinzufügen:
```html
<div class="shoe-card" data-shoe="schuh-id" data-tags="marathon half" data-value="4" data-brand="Marke">
  ...
</div>
```

## Auf GitHub aktualisieren
Nach Änderungen die neue `index.html` einfach hier hochladen:
https://github.com/FilipSucic/laufschuhe-tierlist

## Tiers
| Tier | Bedeutung |
|------|-----------|
| SS   | Sub-2h Weltrekord-Technologie |
| S    | Absolute Elite |
| A    | Top Performer |
| B    | Sehr stark |
| C    | Solider Allrounder |
| D    | Einsteiger |
| ?    | Bald verfügbar |

## China-Marken 🇨🇳
| Marke | Flaggschiff | Preis |
|-------|------------|-------|
| Li Ning | Feidian 6 Elite | ~180–220€ |
| Anta | C202 7 | ~150–180€ |
| Xtep | 160X 6.0 PRO | ~150–200€ |
| 361° | Flame 4.0 | ~120–160€ |

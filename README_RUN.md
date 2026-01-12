# Morocco Fat Loss Dashboard (Run Instructions)

## Requirements
- Node.js 18+ (recommended)

## Install
```bash
npm install
```

## Run (development)
```bash
npm run dev
```
Open the URL printed by Vite (usually http://localhost:5173).

## Build + Preview (offline-ready)
```bash
npm run build
npm run preview -- --host
```

### Offline
Visit the preview URL once while online so the service worker can cache assets.
Then it will keep working offline on the same device/browser.

## Grocery pricing
Open **Grocery** and set **MAD per unit** for each item (e.g. MAD/kg, MAD/pcs). Toggle Weekly/Monthly at the top.

Fitness Planner (Offline-First)

A mobile-first fitness and nutrition planning web app built with React + Vite + TailwindCSS.
Designed for home workouts (dumbbells + bodyweight) and Moroccan-friendly meals, with a goal-based intake calculator and plan generator.

The app works offline after first load, stores all data locally, and does not require accounts or cloud services.

==================================================
FEATURES
==================================================

INTAKE & CALCULATIONS
- User input:
  - Age, gender, height, weight
  - Activity level
  - Training frequency
  - Goal (fat loss, weight gain, maintenance)
- Automatic calculations:
  - BMI
  - BMR (Mifflin–St Jeor)
  - TDEE
  - Daily calorie target
  - Protein / fat / carb targets

PLANNING
- Auto-generated multi-week plan
- Home workouts only:
  - Dumbbells + bodyweight
  - A/B split + optional conditioning
- Daily meals generated to match calorie & macro targets
- Moroccan-friendly food choices with portion control

DAILY EXECUTION
- “Today” view with:
  - Workout steps (warm-up → main → cool-down)
  - Meals
  - Habits
  - Notes
- Simple checklists focused on consistency

CALENDAR
- Monthly calendar view
- Day status:
  - completed / partial / missed
- Click any day to open full details

TRACKING
- Weight tracking (trend-based)
- Waist measurements
- Lightweight charts
- Optional strength tracking

GROCERY PLANNING
- Weekly grocery list auto-generated from meals
- Quantities based on portions
- Designed for local, affordable ingredients

OFFLINE-FIRST
- Works offline after first load
- All data stored locally in the browser
- JSON Export / Import for backup and restore

==================================================
TECH STACK
==================================================
- React 18
- Vite 5
- TailwindCSS 3
- Service Worker (offline caching)
- localStorage persistence
- No backend, no accounts

==================================================
GETTING STARTED
==================================================

REQUIREMENTS
- Node.js 18+

INSTALL
npm install

RUN (DEVELOPMENT)
npm run dev

BUILD & PREVIEW (OFFLINE-READY)
npm run build
npm run preview

After opening the preview once, the app will work offline for the built version.

==================================================
PROJECT STRUCTURE
==================================================

src/
  lib/
    calculations.js   -> BMI, BMR, TDEE, macros
    plan.js           -> plan & calendar generation
    meals.js          -> meal library & balancing logic
    storage.js        -> local persistence & migrations
  pages/
    Dashboard.jsx
    Today.jsx
    Calendar.jsx
    Tracking.jsx
    Grocery.jsx
    Setup.jsx
    Settings.jsx
    Backup.jsx
    About.jsx
  components/
    UI components
public/
  sw.js               -> service worker (offline cache)

==================================================
CUSTOMIZATION
==================================================
- Edit calculations: src/lib/calculations.js
- Add meals or adjust portions: src/lib/meals.js
- Modify workout structure: src/lib/plan.js
- Storage & backups: src/lib/storage.js

==================================================
PRIVACY & DATA
==================================================
- No accounts
- No external APIs
- No analytics
- All data stays on the user’s device

==================================================
DISCLAIMER
==================================================
This project provides general fitness and nutrition guidance for educational purposes only.
It is not medical advice.

==================================================
LICENSE
==================================================
MIT License

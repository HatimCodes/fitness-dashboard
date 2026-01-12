# Fitness Planner (Offline)

A mobile-first fitness + nutrition planning dashboard built with **React + Vite + Tailwind**.  
Designed for **home workouts (dumbbells + bodyweight)** and **Moroccan-friendly meals**, with a **goal-based plan generator** and an offline-first experience.

## Features

### Setup & Calculations
- Intake wizard: age, weight, height, goal (lose / gain / recomposition), activity level, training schedule
- Calculates:
  - BMI
  - BMR (Mifflin–St Jeor)
  - TDEE (activity multiplier)
  - Daily calorie target (safe deficit/surplus)
  - Macros (protein / fat / carbs)

### Planning
- Generates a structured multi-week plan with:
  - Home dumbbell workouts (A/B split + optional conditioning)
  - Daily meals (Morocco-friendly)
  - Auto-balanced meal selection to match targets (within a practical tolerance)

### Daily Execution
- “Today” timeline + checklists for:
  - Workout steps (warm-up → main → cool-down)
  - Meals
  - Habits + notes

### Calendar
- Month view with day status:
  - completed / partial / missed
- Click any day to open full details + checklist

### Tracking
- Weight and waist measurements
- Lightweight charts
- Optional strength tracking

### Grocery
- Weekly grocery list auto-generated from meals
- Works offline (data stored locally)
- (Optional modules can add pricing / monthly estimates)

### Offline-First
- Works offline after first load (Service Worker)
- Auto-saves to localStorage
- JSON Export/Import backup

## Tech Stack
- React 18
- Vite 5
- TailwindCSS 3
- Service Worker caching (offline after first load)
- localStorage persistence + JSON backup

## Getting Started

### Requirements
- Node.js 18+

### Install
```bash
npm install

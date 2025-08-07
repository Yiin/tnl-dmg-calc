# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Throne & Liberty Damage Calculator** - Interactive web application for simulating damage calculations in the MMORPG Throne & Liberty. Enables build comparison, damage visualization, and questlog.gg imports.

Live at: https://yiin.github.io/tnl-dmg-calc/

## Development Commands

```bash
# Development server (localhost:5173 with Vite)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run all tests
npm run test

# Run specific test file
npm run test src/calculations.test.ts
```

## Architecture

### Tech Stack
- **React 19** with TypeScript (strict mode)
- **Vite** build tool
- **Tailwind CSS** + shadcn/ui components  
- **Recharts** for data visualization
- **Radix UI** primitives
- **Vitest** + React Testing Library

### Core Modules

1. **`src/calculations.ts`** - Damage calculation engine
   - Implements T&L damage formulas (hit/evasion, crit/glance, heavy attacks)
   - Handles skill multipliers, defense reduction, PvP modifiers
   - Positional combat calculations (front/side/back)
   - DPS calculations with attack speed and cooldown modifiers

2. **`src/types.ts`** - TypeScript interfaces
   - `Build`: Player stats (damage, crit, hit, heavy attack, skills)
   - `Enemy`: Target configuration (defense, evasion, endurance, resistances)
   - `DamageBreakdown`: Calculation results with all damage components
   - Combat type system (melee/ranged/magic)

3. **`src/App.tsx`** - Main application
   - State management with React hooks
   - localStorage persistence for builds
   - URL-based sharing via hash parameters
   - Tab management for multiple builds

### Key Components

- **`BuildForm.tsx`**: Player stat input with grouped sections
- **`EnemyForm.tsx`**: Target configuration interface
- **`DamageChart.tsx`**: Interactive damage visualization (original with DPS support)
- **`DamageChartRefactored.tsx`**: Simplified chart without DPS calculations
- **`ImportDialog.tsx`**: questlog.gg text parser with regex extraction
- **`ChartControls.tsx`**: Chart configuration (axes, ranges, metrics)

### Important Details

- Path alias: `@/*` → `src/*`
- Base path: `/tnl-dmg-calc/` (GitHub Pages)
- Damage formulas source: [u/Rabubu29's research](https://www.reddit.com/r/throneandliberty/comments/1k2cgcp/)
- Two chart implementations exist - original supports DPS, refactored is cleaner but lacks DPS

## Testing

Tests focus on:
- Damage calculation accuracy (`calculations.test.ts`)
- Component behavior and user interactions
- Import/export functionality

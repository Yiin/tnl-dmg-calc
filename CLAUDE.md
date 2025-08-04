# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Throne & Liberty Damage Calculator** - an interactive web application that simulates damage calculations for the MMORPG Throne & Liberty. It allows players to compare builds, visualize damage output, and import builds from questlog.gg.

## Development Commands

```bash
# Start development server (runs on localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests for a specific file
npm run test src/calculations.test.ts
```

## Architecture

### Tech Stack
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Charts**: Recharts
- **UI Components**: Radix UI primitives
- **Testing**: Vitest + React Testing Library

### Core Files

- **`src/App.tsx`**: Main application component with state management, build/enemy tabs, and URL sharing
- **`src/calculations.ts`**: Damage calculation engine implementing T&L's complex formulas (hit/evasion, crit/glance, heavy attacks, skill multipliers, defenses)
- **`src/types.ts`**: TypeScript definitions for Build, Enemy, DamageBreakdown, and combat types (melee/ranged/magic)
- **`src/components/`**: UI components including BuildForm, EnemyForm, DamageChart, ImportDialog

### Key Concepts

1. **Build System**: Player stats stored in `Build` interface with weapon damage, crit, hit, heavy attack chance, skill damage, and combat-specific stats
2. **Enemy Configuration**: Target stats including defense, evasion, endurance, damage reduction, and resistances
3. **Damage Calculation**: Multi-step process calculating hit chance, crit/glance outcomes, skill multipliers, defense reduction, and final damage with PvP modifiers
4. **State Management**: React hooks with localStorage persistence and URL-based sharing via hash parameters
5. **Import/Export**: Text parser for questlog.gg format using regex patterns to extract stats

### Important Implementation Details

- Path alias configured: `@/*` maps to `src/*`
- TypeScript strict mode enabled
- Base path for GitHub Pages: `/tnl-dmg-calc/`
- Damage formulas based on research from u/Rabubu29
- Supports positional combat (front/side/back attacks)
- Auto-detects dominant combat type (melee/ranged/magic) for chart display

### Component Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── BuildForm.tsx # Player stat input form
│   ├── EnemyForm.tsx # Target configuration
│   ├── DamageChart.tsx # Recharts visualization
│   ├── ImportDialog.tsx # questlog.gg import
│   └── ChartControls.tsx # Chart configuration
├── lib/
│   └── utils.ts      # Utility functions
├── calculations.ts   # Core damage math
├── types.ts         # TypeScript interfaces
└── App.tsx          # Main application
```

## Testing

Tests use Vitest with React Testing Library. Focus areas:
- Damage calculation accuracy in `calculations.test.ts`
- Component behavior and user interactions
- Import/export functionality
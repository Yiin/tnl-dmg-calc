# Throne & Liberty Damage Calculator

An interactive damage calculator for Throne & Liberty that allows players to:

- Simulate damage calculations with accurate game mechanics
- Compare multiple builds side-by-side
- Import builds from questlog.gg via text parsing
- Visualize damage output across different stat ranges
- Account for positional combat (front/side/back attacks)

## Features

- **Accurate Damage Calculations**: Implements T&L's complex damage formulas including crit/glance chances, heavy attacks, skill multipliers, and defensive calculations
- **Build Management**: Create and manage multiple builds with tabbed interface
- **Visual Comparison**: Interactive charts showing damage output across stat ranges
- **Import Functionality**: Import builds by copying stats text from questlog.gg
- **Positional Combat**: Calculate damage based on attack direction (front, side, back)
- **Persistent Storage**: All builds and settings are saved locally

## Live Demo

Visit the calculator at: https://[your-github-username].github.io/tnl/

## Local Development

1. Clone the repository:

```bash
git clone https://github.com/[your-github-username]/tnl.git
cd tnl
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The app will open at http://localhost:3000

## Build Configuration

The project uses Vite for building. Key configurations:

- **Base Path**: Automatically set for GitHub Pages deployment
- **Output Directory**: `dist/`
- **TypeScript**: Strict mode enabled
- **React**: v19 with modern features

## Technologies Used

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts (for data visualization)
- Radix UI (for accessible components)

## Contributing

Feel free to submit issues and pull requests. When contributing:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is open source. Feel free to use and modify as needed.

## Acknowledgments

- Damage formulas based on community research from the T&L Reddit community
- UI components from shadcn/ui
- Build data structure inspired by questlog.gg

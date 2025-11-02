# CarNation Frontend

A modern React application built with Vite, TypeScript, and Tailwind CSS.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Project Structure

```
frontend/
├── public/          # Static assets
├── src/
│   ├── App.tsx      # Main app component
│   ├── main.tsx     # Entry point
│   ├── index.css    # Global styles with Tailwind
│   └── vite-env.d.ts
├── index.html       # HTML template
├── package.json
├── tsconfig.json    # TypeScript config
├── vite.config.ts   # Vite config
├── tailwind.config.js
└── postcss.config.js
```

## Development

The dev server runs at `http://localhost:5173` by default. Hot Module Replacement (HMR) is enabled for instant updates during development.

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.


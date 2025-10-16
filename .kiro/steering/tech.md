# Tech Stack

## Frontend
- **React 19** with TypeScript
- **Vite** as build tool (using rolldown-vite variant)
- **TailwindCSS** for styling with custom color palette
- **ShadCN UI** components (configured in components.json)

## Backend & Services
- **Supabase** for backend services (PostgreSQL + Auth + Storage)
- **Zustand** for state management
- **React Router DOM** for routing
- **React Hook Form + Zod** for form management

## Development Tools
- **TypeScript** (~5.9.3) with strict configuration
- **ESLint** with React-specific rules
- **Vite** for development server and building

## Common Commands

```bash
# Development
npm run dev          # Start development server

# Building
npm run build        # TypeScript compilation + Vite build
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint

# Setup
npm install          # Install dependencies
cp .env.example .env # Setup environment variables
```

## Environment Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

## Path Aliases
- `@/*` maps to `src/*` (configured in vite.config.ts)
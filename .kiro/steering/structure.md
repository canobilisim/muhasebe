# Project Structure

## Root Level
- Configuration files: `package.json`, `vite.config.ts`, `tailwind.config.js`, `components.json`
- TypeScript configs: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
- Entry point: `index.html`

## Source Directory (`src/`)

```
src/
├── components/          # React bileşenleri
│   ├── ui/             # ShadCN UI bileşenleri
│   └── layout/         # Layout bileşenleri
├── pages/              # Sayfa bileşenleri
├── hooks/              # Custom React hooks
├── stores/             # Zustand store'ları
├── services/           # API servisleri
├── types/              # TypeScript tip tanımları
├── utils/              # Yardımcı fonksiyonlar
├── lib/                # Kütüphane yapılandırmaları
├── App.tsx             # Ana uygulama bileşeni
├── main.tsx            # React uygulaması giriş noktası
├── App.css             # Uygulama stilleri
└── index.css           # Global stiller (TailwindCSS)
```

## Folder Conventions

- **components/ui/**: ShadCN UI components only
- **components/layout/**: Header, sidebar, navigation components
- **pages/**: Route-level components
- **hooks/**: Reusable React hooks
- **stores/**: Zustand state management stores
- **services/**: API calls and external service integrations
- **types/**: TypeScript type definitions and interfaces
- **utils/**: Pure utility functions
- **lib/**: Third-party library configurations (Supabase, utils)

## File Naming
- React components: PascalCase (e.g., `CustomerList.tsx`)
- Hooks: camelCase starting with "use" (e.g., `useCustomers.ts`)
- Utilities: camelCase (e.g., `formatCurrency.ts`)
- Types: PascalCase (e.g., `Customer.ts`)

## Import Conventions
- Use `@/` alias for src imports
- Group imports: external libraries first, then internal modules
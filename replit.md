# MotoGo - Moto Ride & Delivery App

## Overview

MotoGo is a moto-taxi and delivery service application built for the Dominican Republic market. It enables users to book motorcycle rides, food delivery, courier services, and errands through a modern mobile-first interface with real-time order tracking and interactive maps centered on Santo Domingo.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Maps**: Leaflet with react-leaflet for interactive mapping
- **Animations**: Framer Motion for smooth UI transitions
- **Theming**: Dark/light mode support with system preference detection
- **Internationalization**: Custom hook-based i18n supporting English and Spanish

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Design**: REST endpoints defined in shared/routes.ts with Zod validation
- **Build System**: Custom esbuild script for production bundling with selective dependency bundling

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: shared/schema.ts contains all table definitions
- **Migrations**: Drizzle Kit with push-based schema sync (db:push command)
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### Authentication
- **Provider**: Replit Auth (OpenID Connect)
- **Session Management**: Express sessions stored in PostgreSQL
- **User Model**: Users table with role-based access (customer, driver, admin)

### Code Organization
```
client/src/          # React frontend
  components/        # Reusable UI components
  hooks/             # Custom React hooks (auth, orders, theme, language)
  pages/             # Route-level page components
  lib/               # Utilities and query client setup
server/              # Express backend
  replit_integrations/auth/  # Replit Auth integration
shared/              # Shared types, schemas, and API definitions
  models/            # Database models (auth.ts)
  schema.ts          # Drizzle table definitions
  routes.ts          # API route definitions with Zod schemas
```

### Key Design Patterns
- **Shared Types**: Schema and route definitions in shared/ are used by both frontend and backend
- **Type-Safe API**: Zod schemas validate both request input and response output
- **Storage Abstraction**: IStorage interface in server/storage.ts allows swapping implementations
- **Component Library**: shadcn/ui components in client/src/components/ui/ provide consistent styling

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe query builder and schema management

### Authentication
- **Replit Auth**: OAuth/OIDC provider (ISSUER_URL defaults to https://replit.com/oidc)
- **SESSION_SECRET**: Required environment variable for session encryption

### Frontend Libraries
- **Leaflet**: Map rendering with default center at Santo Domingo (18.4861, -69.9312)
- **react-leaflet**: React wrapper for Leaflet maps
- **Radix UI**: Headless component primitives for shadcn/ui

### Build & Development
- **Vite**: Development server with HMR and production bundling
- **esbuild**: Server-side TypeScript compilation for production
- **Replit Plugins**: Dev banner, error overlay, and cartographer for Replit environment
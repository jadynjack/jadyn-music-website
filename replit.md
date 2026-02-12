# VANYA Music Artist Website

## Overview

This is a music artist promotional website for VANYA, featuring a new song release ("Midnight/Rainbow"). The site allows fans to stream music, vote for charities to receive proceeds from streams, and subscribe for updates. It includes an admin dashboard for managing stream statistics, site settings, and charity options.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and data fetching
- **Styling**: Tailwind CSS v4 with custom theme variables defined in `client/src/index.css`
- **UI Components**: Shadcn/ui component library (New York style) with Radix UI primitives
- **Animations**: Framer Motion for page transitions and interactive elements
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful API with JSON responses
- **Authentication**: Replit Auth integration using OpenID Connect with Passport.js
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Tables**:
  - `charities`: Stores charity options for voting
  - `votes`: Tracks user votes with email verification
  - `subscribers`: Email newsletter subscribers
  - `streamStats`: Music streaming statistics by platform
  - `siteSettings`: Configurable site content (song title, links)
  - `sessions`: Session storage for authentication
  - `users`: User accounts for Replit Auth

### Key Design Patterns
- **Shared Schema**: Database schemas defined in `shared/` directory are accessible to both client and server
- **Path Aliases**: `@/` maps to client source, `@shared/` maps to shared code
- **Admin Authorization**: Admin access controlled via `ADMIN_EMAIL` environment variable
- **Atomic Vote Counting**: Votes use database transactions to maintain count accuracy

## External Dependencies

### Authentication
- **Replit Auth**: OpenID Connect authentication via Replit's identity provider
- **Session Storage**: PostgreSQL sessions with 7-day TTL

### Database
- **PostgreSQL**: Required via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations stored in `./migrations`

### Analytics & Tracking
- **Google Analytics**: Measurement ID `G-V5GRX79HVR` (client-side via gtag)
- **TikTok Pixel**: Pixel ID `D66PFEBC77U67PE0F0TG` (client-side via ttq)
- **TikTok Events API**: Server-side event tracking via `server/lib/tiktokEvents.ts`
  - Sends Lead events for subscribes and votes
  - Uses SHA-256 hashed emails, IP, user agent for matching
  - Event deduplication via shared `eventId` between pixel and server
  - Client generates `eventId` via `crypto.randomUUID()`, passes to both pixel and API

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `ADMIN_EMAIL`: Email address for admin access control
- `TIKTOK_ACCESS_TOKEN`: TikTok Events API access token for server-side tracking
- `ISSUER_URL`: OpenID Connect issuer (defaults to Replit)
- `REPL_ID`: Replit environment identifier

### Third-Party UI Libraries
- Radix UI primitives for accessible components
- Lucide React for icons
- Embla Carousel for carousels
- Framer Motion for animations

### Build & Development
- Vite for frontend bundling
- esbuild for server bundling
- Custom Vite plugins for Replit-specific features (dev banner, meta images, cartographer)
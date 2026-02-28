# Rovo Character Lab

## Overview

Rovo Character Lab is a web application designed to help users compare and analyze different AI prompt personalities side-by-side. It allows users to create two different personality prompts (A and B), test them with the same input, and receive detailed linguistic and behavioral analysis of the differences between the responses. The application supports both OpenAI (GPT-5) and Anthropic (Claude Sonnet 4) models, providing comprehensive insights into how different prompt instructions affect AI behavior, tone, and output quality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server with HMR support
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching

**UI Component System:**
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Component architecture follows the "New York" style variant
- Design system includes custom CSS variables for theming (light mode primary)

**State Management:**
- Local component state for UI interactions
- TanStack Query for server state with aggressive caching (staleTime: Infinity)
- Custom hooks for reusable logic (useToast, useIsMobile)

**Key Features:**
- Comparison Lab: Side-by-side prompt testing interface with personality trait adjustments
- Real-time diff viewer for analyzing textual differences between AI responses
- Interactive personality controls using sliders for traits (tone, initiative, depth, outputStyle)
- Analysis panel with tabs for linguistic differences, personality scores, reader impact, and sentiment analysis

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript running in ESM mode
- Custom Vite middleware integration for development hot-reloading
- Structured error handling with status code support

**AI Integration:**
- Dual AI provider support: OpenAI (GPT-5) and Anthropic (Claude Sonnet 4)
- AI Service layer abstracts model-specific implementation details
- Analysis Service generates comprehensive comparisons using AI models
- Personality traits dynamically modify system prompts to adjust AI behavior

**Data Models:**
- Users: Basic authentication structure with username/password
- Prompt Tests: Container for A/B prompt comparison experiments
- Prompt Responses: Individual AI responses with timing and personality trait data
- Analysis Results: Structured comparison data including linguistic differences, personality scores, reader impact, and sentiment analysis

**Storage Strategy:**
- In-memory storage implementation (MemStorage) for development
- Interface-based design (IStorage) allows easy swap to database implementation
- Drizzle ORM configured for PostgreSQL with schema definitions
- UUID-based primary keys using PostgreSQL's gen_random_uuid()

### External Dependencies

**AI Services:**
- OpenAI API integration (@anthropic-ai/sdk, OpenAI SDK)
- Default models: GPT-5 (OpenAI) and Claude Sonnet 4-20250514 (Anthropic)
- Environment variables required: OPENAI_API_KEY, ANTHROPIC_API_KEY

**Database:**
- PostgreSQL via Neon serverless driver (@neondatabase/serverless)
- Drizzle ORM for type-safe database queries and migrations
- Schema includes pgTable definitions with JSON fields for complex data structures
- Connection via DATABASE_URL environment variable

**UI Component Libraries:**
- Radix UI primitives for accessible, unstyled components
- Lucide React for iconography
- React Hook Form with Zod resolvers for form validation
- CMDK for command palette functionality

**Development Tools:**
- Replit-specific plugins for runtime error overlay and development banner
- TSX for TypeScript execution in development
- ESBuild for production builds
- Drizzle Kit for database migrations

**Deployment Architecture:**
- Development: Vite dev server with Express API proxy
- Production: Static frontend served by Express with API routes
- Build output: Frontend to dist/public, backend to dist/index.js
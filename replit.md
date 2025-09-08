# Overview

S-Notevid is an AI-powered educational web application that transforms YouTube videos into comprehensive study notes. The application uses artificial intelligence to extract video transcripts, generate structured summaries, and extract key frames to create an interactive learning experience. Students can input YouTube URLs, select their preferred language, and receive well-formatted notes with clickable references that link to relevant visual aids.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with **React 18** and **TypeScript**, utilizing a modern component-based architecture. The application uses **Wouter** for client-side routing instead of React Router, providing a lightweight navigation solution. State management is handled through **TanStack Query (React Query)** for server state management and caching, eliminating the need for Redux or Context API for most use cases.

The UI is built with **shadcn/ui components** and **Radix UI primitives**, providing accessible and customizable components. **Tailwind CSS** is used for styling with a custom design system that includes CSS variables for theming. The build system uses **Vite** for fast development and optimized production builds.

## Backend Architecture
The backend is an **Express.js** server with **TypeScript**, following a clean separation of concerns. The architecture includes:

- **Route handlers** in `/server/routes.ts` for API endpoints
- **Service layer** with dedicated modules for AI processing (`gemini.ts`), YouTube integration (`youtube.ts`), and frame extraction (`frameExtractor.ts`)
- **Storage abstraction** through an interface-based approach in `/server/storage.ts`
- **Database layer** using Drizzle ORM with PostgreSQL

The server uses middleware for authentication, session management, and request logging. Error handling is centralized with proper HTTP status codes and user-friendly error messages.

## Authentication System
Authentication is implemented using **Replit's OpenID Connect (OIDC)** integration with **Passport.js**. The system includes:

- Session-based authentication with PostgreSQL session storage
- Middleware protection for authenticated routes
- User profile management with automatic user creation/updates
- Secure session cookies with proper expiration handling

## Database Design
The application uses **PostgreSQL** with **Drizzle ORM** for type-safe database operations. The schema includes:

- `users` table for Replit user profiles
- `videos` table for YouTube video metadata
- `user_videos` table for user-specific processed content (notes, language, timestamps)
- `sessions` table for authentication session storage

The database design supports multiple languages per video and tracks user-specific processing history.

## AI Integration
The AI processing pipeline uses **Google's Gemini 2.5 Flash** model for content generation:

- **Transcript extraction** from YouTube videos with language fallback mechanisms
- **AI-powered summarization** with structured output formatting
- **Multi-language support** with translation capabilities
- **Reference marker system** for linking notes to visual content

## File Management
Static assets are served through Express.js with organized directory structure:
- `/static/frames/` for extracted video frames
- Placeholder frame generation system (designed for future implementation with ffmpeg/yt-dlp)
- Proper file serving with security considerations

## Frontend State Management
The application uses a hybrid approach for state management:
- **TanStack Query** for server state, caching, and API interactions
- **React hooks** for local component state
- **Custom hooks** for shared logic (authentication, mobile detection)
- **Toast notifications** for user feedback

## Development Workflow
The project is configured for Replit development with:
- **Vite development server** with HMR (Hot Module Replacement)
- **TypeScript compilation** with strict type checking
- **Shared types** between frontend and backend through `/shared/schema.ts`
- **Environment-specific configurations** for development vs production

# External Dependencies

## Core Framework Dependencies
- **React 18** with TypeScript for frontend development
- **Express.js** with TypeScript for backend API server
- **Vite** for frontend build tooling and development server

## Database and ORM
- **PostgreSQL** as the primary database (via Neon serverless)
- **Drizzle ORM** for type-safe database operations and migrations
- **@neondatabase/serverless** for serverless PostgreSQL connections

## Authentication
- **Replit Auth** (OpenID Connect) for user authentication
- **Passport.js** with OpenID Connect strategy
- **express-session** with PostgreSQL session store (connect-pg-simple)

## AI and External APIs
- **Google Generative AI (Gemini)** for content summarization and note generation
- **youtube-transcript** library for extracting video transcripts
- **YouTube video metadata extraction** through web scraping

## UI and Styling
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design system
- **Radix UI** components for accessible UI primitives
- **Font Awesome** icons for visual elements

## State Management and Data Fetching
- **TanStack React Query** for server state management and caching
- **React Hook Form** with Zod validation for form handling
- **Wouter** for lightweight client-side routing

## Development and Build Tools
- **TypeScript** with strict configuration for type safety
- **ESBuild** for server-side bundling in production
- **PostCSS** with Autoprefixer for CSS processing
- **Replit-specific plugins** for development environment integration

## Utility Libraries
- **date-fns** for date manipulation and formatting
- **clsx** and **tailwind-merge** for conditional CSS class handling
- **nanoid** for generating unique identifiers
- **memoizee** for function memoization and caching
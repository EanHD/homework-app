# Homework Buddy Web

## Overview

Homework Buddy is a lightweight Progressive Web App (PWA) designed to help students track classes and assignments with an intuitive Today/Upcoming view system. Built with React, TypeScript, and Vite, the application provides offline-first functionality with local data storage, browser notifications for assignment reminders, and a modern, accessible user interface powered by Mantine components.

The app follows a Speckit workflow for feature development, progressing through specification → plan → tasks → implementation phases. Key features include color-coded class management with emoji support, assignment tracking with progress visualization, streak tracking for motivation, and comprehensive PWA capabilities including installability and service worker support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses a modern React 18 + TypeScript 5 stack with Vite as the build tool and development server. The UI is built with Mantine 7.x components, providing a cohesive design system with built-in accessibility features, responsive behavior, and theming support. The app implements a single-page application (SPA) pattern with client-side navigation using internal state management rather than a traditional router.

### State Management
Application state is managed through Zustand, a lightweight state management library that provides reactive updates across components. The store is organized into slices for different domains (assignments, classes, preferences) with separate repositories for data operations. The architecture ensures that UI components automatically re-render when underlying data changes through the store's subscription mechanism.

### Data Storage Solutions
The app uses a hybrid storage approach:
- **IndexedDB** (via localforage): Primary storage for persistent application data including classes and assignments
- **localStorage**: Configuration data, user preferences, emoji recents, and onboarding state
- **In-memory state**: Active application state managed by Zustand with automatic persistence

Data persistence is handled through repository patterns with automatic save operations triggered by state changes. The system includes migration logic to handle schema evolution and data archival for completed assignments older than 90 days.

### Progressive Web App Implementation
The PWA architecture includes:
- **Service Worker**: Implements app-shell caching strategy with offline support and notification handling
- **Web App Manifest**: Configures installability with proper scope (`/homework-app/`) for GitHub Pages deployment
- **Notification System**: Browser push notifications with fallback strategies for unsupported environments
- **Offline Capability**: Full functionality available without network connectivity

The base URL handling dynamically adapts to deployment environments (localhost vs GitHub Pages) through a centralized base path utility.

### UI/UX Architecture
The interface follows a responsive design with:
- **AppShell Pattern**: Left navigation sidebar (desktop) / drawer (mobile) with top header
- **Component-Based Design**: Reusable components for assignments, classes, progress indicators, and forms
- **Accessibility-First**: WCAG AA compliance with focus management, screen reader support, and reduced motion preferences
- **Theme System**: Centralized design tokens with support for light/dark themes and font scaling

### Testing Strategy
The testing architecture uses Vitest with jsdom for unit and integration testing. Tests cover:
- **Store Logic**: State mutations, selectors, and persistence
- **Component Behavior**: User interactions and rendering
- **Integration Scenarios**: End-to-end workflows like assignment creation and completion

Test setup includes polyfills for browser APIs not available in jsdom (ResizeObserver, matchMedia, URL.createObjectURL).

## External Dependencies

### Core Framework Dependencies
- **React 18.3** & **React DOM**: UI framework with modern concurrent features
- **TypeScript 5.4**: Static typing and enhanced developer experience
- **Vite 5.4**: Build tool and development server with fast HMR

### UI and Interaction Libraries
- **@mantine/core 7.14**: Component library providing buttons, forms, navigation, and layout components
- **@mantine/hooks 7.14**: React hooks for common patterns and browser APIs
- **@mantine/dates 7.14**: Date picker components for assignment due dates
- **@mantine/notifications 7.14**: Toast notification system
- **@tabler/icons-react 3.19**: Icon library for consistent iconography

### State Management and Data
- **zustand 4.5**: Lightweight state management with TypeScript support
- **localforage 1.10**: IndexedDB abstraction layer for persistent storage
- **dayjs 1.11**: Date manipulation library for timezone handling and formatting

### Emoji and User Experience
- **@emoji-mart/react 1.1** & **@emoji-mart/data 1.2**: Built-in emoji picker for class customization
- **nanoid 5.0**: Unique ID generation for entities

### PWA and Service Worker
- **workbox-window 7.3**: Service worker lifecycle management and updates

### Development and Testing
- **@vitejs/plugin-react 4.3**: Vite plugin for React support
- **vitest 2.0**: Test runner with TypeScript and JSX support
- **@testing-library/react 16.0** & **@testing-library/user-event 14.5**: Testing utilities for component behavior
- **jsdom 24.1**: DOM implementation for testing environment

### Deployment Platform
- **GitHub Pages**: Static hosting with automated deployment via GitHub Actions
- **Custom Domain Support**: Configured for `https://eanhd.github.io/homework-app/` with proper base path handling
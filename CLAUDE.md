# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native Expo application called "VapApp" built with TypeScript. The app uses Supabase for backend services, Zustand for state management, and React Navigation for routing. It currently implements an authentication system with welcome, login, signup, and password recovery screens.

## Development Commands

- `npm start` or `expo start` - Start the Expo development server
- `npm run android` or `expo start --android` - Start on Android device/emulator
- `npm run ios` or `expo start --ios` - Start on iOS device/simulator
- `npm run web` or `expo start --web` - Start web version

## Architecture

### Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Input, Typography)
│   ├── forms/          # Form components (AddressForm, ProfileSelector)
│   └── common/         # Common components with business logic
├── screens/            # Screen components organized by feature
│   └── auth/           # Authentication screens
├── navigation/         # Navigation configuration and types
├── services/           # API and external service integrations
│   ├── auth/           # Authentication service layer
│   └── supabase/       # Supabase client configuration
├── stores/             # Zustand state management stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and constants
│   └── constants/      # App constants (colors, fonts, sizes)
└── assets/             # Static assets (images, icons)
```

### Key Technologies

- **Frontend**: React Native (0.81.4) with Expo (~54.0.9)
- **Backend**: Supabase with `@supabase/supabase-js`
- **State Management**: Zustand for global state
- **Navigation**: React Navigation v7 (native stack)
- **Forms**: React Hook Form with Yup validation
- **Storage**: Expo Secure Store for token persistence
- **Data Fetching**: TanStack React Query

### Authentication System

The app uses Supabase Auth with the following setup:
- **Client**: `src/services/supabase/client.ts` - Configured with Expo Secure Store adapter
- **Service Layer**: `src/services/auth/authService.ts` - Auth operations abstraction
- **State Management**: `src/stores/authStore.ts` - Zustand store for auth state
- **Screens**: All auth screens in `src/screens/auth/`

Authentication state is managed globally through Zustand and persisted securely using Expo Secure Store.

### Navigation Structure

Navigation is handled by React Navigation with TypeScript support:
- Main navigator in `src/navigation/AppNavigator.tsx`
- Type definitions in `src/types/navigation.types.ts`
- Currently implements a stack navigator for auth flow

### Component Architecture

- **UI Components**: Base components in `src/components/ui/` (Button, Input, Typography)
- **Form Components**: Reusable form components in `src/components/forms/`
- **Index Exports**: Each directory has an `index.ts` for clean imports

### Environment Configuration

The app uses environment variables for Supabase configuration:
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

## Code Conventions

- TypeScript strict mode enabled
- Barrel exports pattern (index.ts files)
- Organized imports from relative paths
- Component props typed with interfaces
- Zustand stores follow functional pattern
- Colors, fonts, and sizes defined as constants
# Multiverse

A small React Native app built for the Multiverse challenge using Expo and the Rick and Morty API. It lets users browse characters, search and filter results, view character details, and save persistent favorites across the app.

## Overview

The app is built with Expo, Expo Router, NativeWind, TanStack Query, and strict TypeScript, matching the technical requirements described in the challenge. Navigation is file-based, with tabs for the main experience and a dynamic route for the character details screen.

## Features

- Character list screen with API-driven data fetching.
- Search support using the Rick and Morty API `name` parameter.
- Filters for status, gender, and species based on supported API query parameters.
- Pagination or infinite-scroll friendly architecture powered by TanStack Query.
- Character detail screen implemented with an Expo Router dynamic route such as `[id]`.
- Favorites tab with add/remove actions from multiple screens.
- Persisted favorites so selections survive app restarts.
- Loading, error, and empty states for a more complete UX.
- Localization support.

## Tech stack

- Expo (managed workflow)
- Expo Router
- React Native
- TypeScript with `strict: true`
- NativeWind v4 + Tailwind
- `@tanstack/react-query`
- AsyncStorage
- `react-i18next` / `i18next`
- `react-native-reanimated`

## API

This project uses the [Rick and Morty API](https://rickandmortyapi.com/documentation). The character endpoint supports filters such as `name`, `status`, `species`, and `gender`, which map well to the challenge requirements.[1]

## Project structure

```txt
app/
  (tabs)/
  character/
    [id].tsx
components/
hooks/
services/
store/
locales/
types/
utils/
```

The exact folder names may vary slightly, but the important architectural idea is that routing, API logic, shared state, and reusable UI stay separated and easy to review.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the Expo development server

```bash
npx expo start
```

### 3. Run on a device or simulator

- Press `a` for Android emulator.
- Press `i` for iOS simulator on macOS.
- Scan the QR code with Expo Go or open the development build, depending on your local setup. The app will probably not work on Expo Go though, due to the native dependencies, so using a development build is recommended.

## Implementation notes

- **Remote data** is handled with TanStack Query, which is designed for promise-based asynchronous queries and works with React Native.
- **Navigation** is handled by Expo Router using file-based routing and dynamic route segments.
- **Favorites** are stored in shared app state and persisted locally so they are available across screens and app restarts.
- **Styling** is done with NativeWind to keep components consistent and easy to maintain. Note: NativeWind 4 is problematic with hot reload and crashes metro sometimes.
- **Localization** is included to support a multi-language experience.

## Testing

Basic automated tests are included. (AI assisted, so they are not comprehensive but demonstrate the approach.)

Run them with:

```bash
npm run test
```

## Challenge coverage

| Requirement                            | Status      |
| -------------------------------------- | ----------- |
| List screen                            | Implemented |
| Search and/or filter                   | Implemented |
| Detail screen with dynamic route       | Implemented |
| Favorites in separate tab              | Implemented |
| Shared favorites access across screens | Implemented |
| Persisted favorites                    | Implemented |
| Loading, error, and empty states       | Implemented |
| Expo Router + layout group             | Implemented |
| TanStack Query as data layer           | Implemented |
| TypeScript strict mode                 | Implemented |
| Bonus: localization                    | Implemented |

## Notes for reviewers

This project was built as a focused coding challenge submission, so the main goal was clear architecture, good mobile UX, and clean implementation of the requested features rather than adding unnecessary complexity. The app is intentionally small, but it demonstrates routing, server-state management, local persistence, reusable components, and a scalable project structure.

Thanks for taking the time to review this submission!

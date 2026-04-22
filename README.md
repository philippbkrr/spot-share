# SpotShare 📍

Deine Geheimtipps-App — finde und teile lokale Empfehlungen.

## Quick Start

```bash
cd SpotShare
npx expo start
```

Scanne den QR-Code mit der **Expo Go** App auf deinem Handy.

## Features

- 🗺️ **Interaktive Karte** mit OpenStreetMap
- 📍 **Geheimtipps erstellen** mit GPS, Fotos, Beschreibung
- ⭐ **Bewertungen & Kommentare**
- 🔐 **Auth** (Login/Signup)
- 👤 **Profile** mit eigenen Geheimtipps
- ✏️ **Bearbeiten & Löschen** deiner Spots

## Tech Stack

- **Expo** (React Native)
- **Supabase** (Auth, Database, Storage)
- **react-native-maps** (OpenStreetMap)
- **expo-image-picker** (Fotos)
- **expo-location** (GPS)

## Projektstruktur

```
SpotShare/
├── App.tsx                 # Main app + routing
├── app.json               # Expo config
├── src/
│   ├── components/        # UI components
│   │   ├── MapScreen.tsx
│   │   ├── AuthScreen.tsx
│   │   ├── CreateSpotScreen.tsx
│   │   ├── EditSpotScreen.tsx
│   │   ├── SpotDetailScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── base/          # Button, Card, Input, etc.
│   ├── hooks/             # useAuth, useLocation
│   ├── lib/supabase.ts     # Supabase client
│   ├── theme/tokens.ts    # Design tokens
│   └── types/             # TypeScript types
└── supabase/migrations/    # Database schema
```

## Setup

1. **Supabase Projekt** — bereits konfiguriert
2. **Environment Variables** — `.env.local` erstellen:

```
EXPO_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
```

3. **Datenbank Migration** — läuft automatisch via Supabase CLI

## Bereit zum Testen

```bash
npx expo start
```

QR-Code mit Expo Go scannen → App öffnet sich auf dem Handy.

## Entwicklung

- `npx expo start --clear` — Cache leeren
- `npx expo prebuild` — Native Code generieren (für EAS Build)

## Deployment (später)

- **EAS Build** für App Store / Play Store
- **EAS Submit** für automatisches Upload

---

Made with ❤️ for Philipp

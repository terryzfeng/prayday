# Prayday 🙏

A personal prayer companion app to organize prayer requests and cultivate a daily prayer habit.

Live at **[prayday.app](https://prayday.app/)**

## Contributors

- Andy Feng
- Terry Feng

## Features

- **Prayer Tracker**: Create prayer cards with reminders and priority highlighting.
- **End-to-End Encryption**: Optional zero-knowledge client-side encryption (AES-256-GCM).
- **Prayer Habits**: Monthly activity contribution grid and statistics.
- **Sync & Offline**: Works offline with local IndexedDB storage; syncs across devices with an account.
- **Themes & PWA**: Dark/Light mode support and installable on iOS/Android.

## Tech Stack

- **Frontend**: Svelte 5, TypeScript, Tailwind CSS, Vite
- **Backend / Database**: Firebase (Auth, Firestore, Hosting), IndexedDB
- **Testing**: Vitest

## Testing

Tests are powered by **Vitest** for native Node `webcrypto` support, enabling direct testing of the Web Crypto API pipeline (AES-256-GCM, PBKDF2) without mock libraries or jsdom crypto polyfills.

*Migrated from Jest to Vitest for faster test execution and more comprehensive native Web Crypto API support.*

## Security and System Architecture

- [Client-Side System Architecture & Data Synchronization Flow Diagram](https://docs.google.com/document/d/1DMa3jbmf0ILEq5pmgwmhic27rksiHKOx7Vtg8Gft_c8/edit?usp=sharing)

## Getting Started

### Prerequisites

- Node.js (v20+)
- npm

### Setup

```bash
# Clone the repository
git clone https://github.com/terryzfeng/prayday.git
cd prayday

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```

### Development

```bash
# Start dev server
npm run dev

# Run tests
npm run test:unit -- --run

# Type check
npm run check

# Build for production
npm run build
```

## License

Copyright (c) 2024 Terry Feng. All rights reserved.

This source code and related assets are proprietary and confidential. 
Unauthorized copying, modification, distribution, public display, or 
use of this software, via any medium, is strictly prohibited without the 
prior written permission of the copyright owner.

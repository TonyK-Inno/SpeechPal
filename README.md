# SpeechPal

A mobile Voice-to-Text Communication Assistant for real-time transcription, designed for accessibility and clarity.

## Features

- Real-time speech-to-text transcription
- Large, readable, high-contrast UI
- Manual conversation saving and history
- Adjustable font size and language
- Screen protection mode to prevent accidental taps

## Getting Started

### Prerequisites

- **Node.js** (LTS recommended)
- **Yarn** or **npm**
- **Expo CLI** (`npm install -g expo-cli`)
- **Xcode** (for iOS) or **Android Studio** (for Android)

### Installation

1. Clone the repository:
   ```sh
   git clone <your-repo-url>
   cd SpeechPal
   ```
2. Install dependencies:
   ```sh
   yarn install
   # or
   npm install
   ```

### Running the App

> **Note:** This project uses native modules (e.g., speech recognition, MMKV) and **cannot be run in Expo Go**. You must use development builds or run in bare/managed dev mode.

#### iOS

```sh
npx expo run:ios
```

#### Android

```sh
npx expo run:android
```

This will build a development client and launch the app on your simulator or device.

### Additional Notes

- Make sure you have the necessary native dependencies installed (CocoaPods for iOS, etc.).

---

For more details, see the codebase and comments. PRs and issues welcome!

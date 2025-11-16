# Jar3aty - Medication Management App

A complete React Native Expo app designed to help patients organize and get reminders for their medication schedules.

## Features

- **Medication Management**: Add, view, and delete medications with detailed information
- **Smart Reminders**: Schedule local notifications for medication times
- **Medication Logs**: Track when medications are taken with detailed logs
- **Backup & Restore**: Export and import your data as JSON files
- **Offline Storage**: All data stored locally using AsyncStorage
- **Clean UI**: Modern interface using React Native Paper

## Tech Stack

- **React Native** with Expo SDK
- **React Navigation** (Stack Navigator)
- **AsyncStorage** for local data persistence
- **expo-notifications** for medication reminders
- **React Native Paper** for UI components
- **TypeScript** for type safety

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Run on your preferred platform:
   - Press `w` for web
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan the QR code with Expo Go app on your device

## Project Structure

```
Jar3aty/
├── app/                    # Expo Router app directory
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Main app with navigation
├── screens/               # All app screens
│   ├── HomeScreen.tsx
│   ├── AddMedicationScreen.tsx
│   ├── LogScreen.tsx
│   ├── EditLogScreen.tsx
│   └── BackupScreen.tsx
├── data/                  # Data models
│   └── models.ts
├── utils/                 # Utility functions
│   ├── storage.ts         # AsyncStorage operations
│   └── notifications.ts   # Notification handling
└── components/            # Reusable components

```

## Screens

### HomeScreen
- Displays list of all medications
- Shows next dose time and last taken status
- Floating action button to add new medication
- Access to backup & restore

### AddMedicationScreen
- Form to add new medications
- Fields: name, dose, route, times, notes
- Multiple time picker support
- Validates required fields

### LogScreen
- Shows all medication logs
- Filter by specific medication
- View taken/not taken status
- Tap to edit log entries

### EditLogScreen
- Toggle medication taken status
- Set or change taken time
- Quick "Mark as Taken Now" button

### BackupScreen
- Export data to JSON file
- Import data from JSON file
- Clear all data option

## Data Model

### Medications
```typescript
{
  id: string;
  name: string;
  dose: string;
  route: 'Tablet' | 'Spoon/Syrup' | 'Intramuscular Injection' |
         'Intravenous Injection' | 'Inhaler' | 'Drop' | 'Cream';
  times: string[];
  notes?: string;
  createdAt: string;
}
```

### Logs
```typescript
{
  id: string;
  medicationId: string;
  scheduledTime: string;
  taken: boolean;
  takenTime?: string;
  date: string;
}
```

## Notifications

The app uses `expo-notifications` to schedule local reminders:
- Notifications are scheduled for each medication time
- Repeats daily at specified times
- Requires notification permissions (requested on app start)
- Note: Notifications don't work on web platform

## Platform Support

- **iOS**: Full support with native features
- **Android**: Full support with native features
- **Web**: Supported with limited features (no notifications)

## License

MIT

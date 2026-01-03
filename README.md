# React Native Task Management App

This is a React Native mobile application built for a technical task. It illustrates integration with Firebase (Auth & Firestore), Google Maps, and Socket.IO for real-time updates.

## Features

1.  **Authentication**: Users can Sign Up and Log In using Firebase Email/Password authentication.
2.  **Task Management**:
    *   Add new tasks with Title and Description.
    *   Tasks are stored in Firebase Firestore.
    *   Tasks have a status: `pending`, `in-progress`, `completed`.
    *   Real-time list updates using Firestore snapshot listeners.
3.  **Map Integration**:
    *   Tasks are displayed as markers on a Google Map.
    *   Clicking a marker shows the task title and status.
    *   New tasks are added at the current map center location.
4.  **Real-Time Notifications (Sockets)**:
    *   The app listens for `taskUpdated` events via Socket.IO.
    *   When a task status is updated, a socket event is emitted to the server.
    *   (Note: Depends on a running Socket.IO server).

## Setup Instructions

### 1. Prerequisites
*   Node.js installed.
*   React Native development environment set up (Android Studio/Xcode).

### 2. Installation
```bash
npm install
# or
yarn install
```

### 3. Firebase Setup
*   The project uses Firebase for Auth and Database.
*   **Sign-in Method**: Email/Password is enabled.
*   **Firestore Database**: A collection named `tasks` is used.
*   **Configuration**: The config is located in `src/services/firebase.js`.
    *   *Note: For a production app, use `.env` files for keys.*

### 4. Google Maps Setup
*   The app uses `react-native-maps`.
*   **Android**: API Key is configured in `app.json` or `android/app/src/main/AndroidManifest.xml` (ensure you have a valid key with Maps SDK for Android API enabled).
    *   Current setup assumes the Expo/React Native template has handled basic map config, but you may need to add your API key if map tiles don't load.

### 5. Socket.IO Setup
*   The app connects to a Socket.IO server defined in `src/services/socket.js`.
*   **Default URL**: `http://10.0.2.2:3000` (for Android Emulator to verify localhost).
*   **Server Code**: A simple server is needed to relay events. Create a `server` folder with `index.js`:
    ```javascript
    const io = require('socket.io')(3000);

    io.on('connection', (socket) => {
      console.log('User connected');

      socket.on('taskStatusChanged', (data) => {
        // Broadcast to all other clients
        socket.broadcast.emit('taskUpdated', data);
      });
    });
    ```
*   Run the server using `node server/index.js`.

### 6. Running the App
```bash
# Start Metro Bundler
npx react-native start

# Run on Android
npx react-native run-android (or npm run android)

# Run on iOS
npx react-native run-ios (or npm run ios)
```

## Assumptions & Shortcuts
*   **Authentication Persistence**: We rely on standard Firebase JS SDK behavior. For robust mobile persistence, `react-native-async-storage` integration with Firebase is recommended but might not be fully configured in this short task.
*   **Location Selection**: To keep the UI simple, new tasks are automatically assigned the coordinates of the **center of the map** currently viewed.
*   **Socket Server**: The app assumes a local server is running for the "extra" notification feature. If the server is not running, the app continues to work (Firestore provides the primary real-time data sync).

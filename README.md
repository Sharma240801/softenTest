# React Native Task Management App

This is a React Native mobile application built for a technical task. It illustrates integration with Firebase (Auth & Realtime Database), Google Maps, and Socket.IO for real-time updates.

## Features

1.  **Authentication**: Users can Sign Up and Log In using Firebase Email/Password authentication.
2.  **Task Management**:
    *   Add new tasks with Title and Description.
    *   Tasks are stored in **Firebase Realtime Database**.
    *   Each task has: `Title`, `Description`, `Status` (pending / in-progress / completed), and `Latitude / Longitude`.
    *   Real-time list updates using Firebase `onValue` listeners.
3.  **Map Integration**:
    *   Tasks are displayed as markers on a Google Map using `react-native-maps`.
    *   Marker color changes based on task status.
    *   Clicking a marker (Callout) shows the task title and status.
    *   New tasks are added at the current map center location.
4.  **Real-Time Notifications (Sockets)**:
    *   The app uses `socket.io-client` to communicate status changes.
    *   When a task status is updated, a `taskStatusChanged` event is emitted.
    *   The app listens for `taskUpdated` events and shows a toast notification if another user updates a task.

## Setup Instructions


### 1. Installation
```bash
npm install or yarn
# or
yarn install
```

### 2. Firebase Setup
*   The project uses Firebase for Auth and Realtime Database.
*   **Sign-in Method**: Enable Email/Password in the Firebase Console.
*   **Realtime Database**: Create a database and set rules (for testing, you can use public rules or authenticated-only).
*   **Configuration**: The config is located in `src/services/firebase.js`. It is already pre-configured with a test project, but you can update it with your own credentials.

### 3. Google Maps Setup
*   The app uses `react-native-maps`.
*   **API Key**: 
    - **Android**: Add your Google Maps API Key to `android/app/src/main/AndroidManifest.xml`:
      ```xml
      <meta-data
        android:name="com.google.android.geo.API_KEY"
        android:value="YOUR_GOOGLE_MAPS_API_KEY"/>
      ```
    - Also ensure the key is added in `app.json` if using Expo.
*   Make sure "Maps SDK for Android" is enabled in your Google Cloud Console.

### 4. Socket.IO Setup (Real-time updates)
*   The app connects to a Socket.IO server defined in `src/services/socket.js`.

*   **Default URL**: `http://10.0.2.2:3000` (for Android Emulator). (But we need a hosted url so it is working on the real device.Right now it is not working because it is not hosted)
*   **How it works**:
    - When you update a task status, the app calls `socket.emit('taskStatusChanged', data)`.
    - A simple Node.js server (see example below) receives this and broadcasts it.
*   **Example Server Code** (`server/index.js`):
    ```javascript
    const io = require('socket.io')(3000, {
      cors: { origin: "*" }
    });

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('taskStatusChanged', (data) => {
        console.log('Status changed:', data);
        // Broadcast to all other connected clients
        socket.broadcast.emit('taskUpdated', data);
      });
    });
    ```
*   Run the server using `node server/index.js`.

### 6. Running the App
```bash
# Start Metro Bundler
npx expo start

# Run on Android
npx expo run:android

# Run on iOS
npx expo run:ios
```

## Assumptions & Shortcuts
*   **Persistence**: Handled via `redux-persist`, keeping the user logged in even after the app restarts.
*   **Task Location**: For ease of use, the task location is set to the **center of the map** when the "Add Task" modal is opened. You can move the map to pick a location.
*   **Socket Mocking**: If no socket server is running, the app functions normally using Firebase's native real-time sync. Socket events are an additional layer as requested in the task.
*   **User Specific Tasks**: Tasks are organized by `user.uid` in the database, so users only see their own tasks.

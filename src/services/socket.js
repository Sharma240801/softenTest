
import io from 'socket.io-client';

// Use your computer's IP address if testing on a real device
// Use 'http://10.0.2.2:3000' for Android Emulator
// Use 'http://localhost:3000' for iOS Simulator
const SOCKET_URL = 'http://10.0.2.2:3000';

const socket = io(SOCKET_URL);

export default socket;

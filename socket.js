import { io } from "socket.io-client";

export const socket = io("http://YOUR_LOCAL_IP:3000", {
    transports: ["websocket"],
});

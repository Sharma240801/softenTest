import { io } from "socket.io-client";

export const socket = io("https://10.26.27.151:3000", {
    transports: ["websocket"],
});

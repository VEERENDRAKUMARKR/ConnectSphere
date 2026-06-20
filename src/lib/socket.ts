import { io } from "socket.io-client";

// Get URL from environment or fallback to current origin
const URL = window.location.origin;

export const socket = io(URL, {
  autoConnect: false,
  reconnection: true,
});

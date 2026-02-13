import { io } from "socket.io-client";

const BACKEND_URL =
  process.env.REACT_APP_BACKENDURL || "http://localhost:8000";

const socket = io(BACKEND_URL, {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;

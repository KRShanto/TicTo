import GameData from "./game";
import { RoomErrorType } from "./room-error";

export interface ServerToClientEvents {
  "room-created": (roomId: string) => void;
  "join-request-to-owner": (username: string, socketId: string) => void;
  "join-response": (data: { accept: boolean; roomId: string }) => void;
  "set-socketId": (socketId: string) => void;
  "room-error": (error: RoomErrorType) => void;
  "game-data": (gameData: GameData) => void;
  "game-over": (winner: string | null) => void;
  "play-again-request": () => void;
  "play-again-response": (accept: boolean) => void;
  message: (message: string) => void;
  "join-request-sent": () => void;
  left: () => void;
}

export interface ClientToServerEvents {
  "set-username": (username: string) => void; // TODO: get the userId from the session
  "join-request": (roomId: string) => void;
  "join-response-from-owner": (data: {
    // username: string;
    accept: boolean;
    socketId: string;
  }) => void;
  "create-room": (roomId: string) => void;
  "add-me": (roomId: string) => void;
  "make-move": (data: { rowIndex: number; cellIndex: number }) => void;
  "play-again": () => void;
  "play-again-response": (accept: boolean) => void;
  "leave-room": () => void;
  message: (message: string) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  username: string;
  requestedRoomId: string;
  roomId: string;
  socketId: string;
}

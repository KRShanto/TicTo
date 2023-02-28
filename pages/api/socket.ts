import { Server } from "socket.io";
import dbConnect from "../../lib/dbConnect";
import { NextApiRequest, NextApiResponse } from "next";
import {
  SocketData,
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
} from "../../types/socket";
import GameData from "../../types/game";
import { MIN, MAX, BOARD_DEFAULT } from "../../constants/game";

const SocketHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  let gameData = new Map<string, GameData>();

  // @ts-ignore
  if (!res.socket?.server.io) {
    // Create a new socket server
    const io = new Server<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
      // @ts-ignore
    >(res.socket?.server);
    // @ts-ignore
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("A user connected: " + socket.id);

      socket.on("set-username", (username) => {
        socket.data.username = username;
        socket.emit("set-socketId", socket.id);
      });

      socket.on("create-room", (roomId) => {
        // Check if the user is already in a room
        if (socket.data.roomId) {
          // Send a response to the sender
          socket.emit("room-error", "ALREADY_JOINED");
        } else {
          // Check if the room already exists
          const room = io.sockets.adapter.rooms.get(roomId);

          if (room && room.size > 0) {
            // Send a response to the sender
            socket.emit("room-error", "ALREADY_EXISTS");
          } else {
            // Join the user to the room
            socket.join(roomId);
            socket.data.roomId = roomId;
            socket.emit("room-created", roomId);
          }
        }
      });

      socket.on("join-request", (roomId) => {
        // Check if the room exists
        const room = io.sockets.adapter.rooms.get(roomId);

        if (!room) {
          socket.emit("room-error", "NOTFOUND");
        } else if (room && socket.data.username) {
          if (room.size >= 2) {
            socket.emit("room-error", "FULL");
          } else {
            // TODO: send the email/more of the user to the owner
            socket
              .to(roomId)
              .emit("join-request-to-owner", socket.data.username, socket.id);

            // Send a response to the sender that the request was sent
            socket.emit("join-request-sent");
          }
        }
      });

      socket.on("join-response-from-owner", ({ accept, socketId }) => {
        const currentRoomId = socket.data.roomId;

        if (currentRoomId) {
          if (accept) {
            // Join the user to the room
            io.sockets.adapter.rooms.get(currentRoomId)?.add(socketId);

            // Send a response to the user
            socket.to(socketId).emit("join-response", {
              accept,
              roomId: currentRoomId,
            });
          } else {
            // Send a response to the user
            socket.to(socketId).emit("join-response", {
              accept,
              roomId: currentRoomId,
            });
          }
        }
      });

      socket.on("add-me", (roomId) => {
        // join the room
        socket.join(roomId);
        socket.data.roomId = roomId;

        // Now initialize the game

        const size = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
        const board = [];
        const availableMoves = [];
        let nextMoveSocketId = socket.id; // default

        // Generate default values for the board based on the size
        for (let i = 0; i < size; i++) {
          const row = [];
          for (let j = 0; j < size; j++) {
            row.push(BOARD_DEFAULT);
          }
          board.push(row);
        }

        // Generate the available moves
        for (let i = 0; i < size * size; i++) {
          availableMoves.push(i);
        }

        // Get all players in the room and select one randomly
        const players = io.sockets.adapter.rooms.get(roomId)?.values();

        if (players) {
          const playerArray = Array.from(players); // Convert the iterator to an array
          const randomIndex = Math.floor(Math.random() * playerArray.length); // Generate a random index
          const randomPlayer = playerArray[randomIndex];
          nextMoveSocketId = randomPlayer;

          // Initialize the data
          const init: GameData = {
            board,
            availableMoves,
            nextMoveSocketId,
            size,
          };

          gameData.set(roomId, init);

          // Send the data to the players
          socket.to(roomId).emit("game-data", init);
          socket.emit("game-data", init);
        }
      });

      socket.on("make-move", ({ rowIndex, cellIndex }) => {
        const roomId = socket.data.roomId;

        if (roomId) {
          const data = gameData.get(roomId);

          if (data) {
            let { board, availableMoves, nextMoveSocketId, size } = data;

            // Update the values
            board[rowIndex][cellIndex] = nextMoveSocketId; // NOTE that this value will be changed in client side
            availableMoves = availableMoves.filter(
              (move) => move !== rowIndex * size + cellIndex
            );
            // opposite of the current player
            const players = io.sockets.adapter.rooms.get(roomId)?.values();

            if (players) {
              const playerArray = Array.from(players);
              nextMoveSocketId =
                playerArray[0] === nextMoveSocketId
                  ? playerArray[1]
                  : playerArray[0];

              // Update the data
              gameData.set(roomId, {
                board,
                availableMoves,
                nextMoveSocketId,
                size,
              });

              for (let i = 0; i < size; i++) {
                let winner: string | null = nextMoveSocketId;
                let row = board[i];

                if (row[0] !== "" && row.every((cell) => cell === row[0])) {
                  winner = row[0];

                  socket.emit("game-over", winner);
                  socket.to(roomId).emit("game-over", winner);
                  break;
                }
              }

              // Check columns
              for (let i = 0; i < size; i++) {
                let winner: string | null = nextMoveSocketId;
                let column = board.map((row) => row[i]);

                if (
                  column[0] !== "" &&
                  column.every((cell) => cell === column[0])
                ) {
                  winner = column[0];

                  socket.emit("game-over", winner);
                  socket.to(roomId).emit("game-over", winner);
                  break;
                }
              }

              // Check diagonals (left to right)
              let winner: string | null = nextMoveSocketId;
              let diagonal = board.map((row, index) => row[index]);

              if (
                diagonal[0] !== "" &&
                diagonal.every((cell) => cell === diagonal[0])
              ) {
                winner = diagonal[0];

                socket.emit("game-over", winner);
                socket.to(roomId).emit("game-over", winner);
              }

              // Check diagonals (right to left)
              winner = nextMoveSocketId;
              diagonal = board.map((row, index) => row[size - index - 1]);

              if (
                diagonal[0] !== "" &&
                diagonal.every((cell) => cell === diagonal[0])
              ) {
                winner = diagonal[0];

                socket.emit("game-over", winner);
                socket.to(roomId).emit("game-over", winner);
              }

              // Check if there is a draw
              if (availableMoves.length === 0) {
                socket.emit("game-over", null);
                socket.to(roomId).emit("game-over", null);
              }

              // Send the data to the players
              socket.to(roomId).emit("game-data", {
                board,
                availableMoves,
                nextMoveSocketId,
                size,
              });
              socket.emit("game-data", {
                board,
                availableMoves,
                nextMoveSocketId,
                size,
              });
            } else {
              console.log("No players in the room");
            }
          } else {
            console.log("No data for the room");
          }
        } else {
          console.log("No room id");
        }
      });

      socket.on("play-again", () => {
        // Send request to the other player
        socket.data.roomId &&
          socket.to(socket.data.roomId).emit("play-again-request");
      });

      socket.on("play-again-response", (accept) => {
        // Send response to the other player
        socket.data.roomId &&
          socket.to(socket.data.roomId).emit("play-again-response", accept);

        if (accept) {
          // Reset the game
          const roomId = socket.data.roomId;

          if (roomId) {
            const data = gameData.get(roomId);

            if (data) {
              let { board, availableMoves, nextMoveSocketId, size } = data;

              // reset all values
              size = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
              board = [];
              availableMoves = [];

              // Generate default values for the board based on the size
              for (let i = 0; i < size; i++) {
                const row = [];
                for (let j = 0; j < size; j++) {
                  row.push(BOARD_DEFAULT);
                }
                board.push(row);
              }

              // Generate the available moves
              for (let i = 0; i < size * size; i++) {
                availableMoves.push(i);
              }

              // Get all players in the room and select one randomly
              const players = io.sockets.adapter.rooms.get(roomId)?.values();

              if (players) {
                const playerArray = Array.from(players);
                const randomIndex = Math.floor(
                  Math.random() * playerArray.length
                );
                nextMoveSocketId = playerArray[randomIndex];

                // Update the data
                gameData.set(roomId, {
                  board,
                  availableMoves,
                  nextMoveSocketId,
                  size,
                });

                // Send the data to the players
                socket.to(roomId).emit("game-data", {
                  board,
                  availableMoves,
                  nextMoveSocketId,
                  size,
                });
                socket.emit("game-data", {
                  board,
                  availableMoves,
                  nextMoveSocketId,
                  size,
                });
              } else {
                console.log("No players in the room");
              }
            } else {
              console.log("No data for the room");
            }
          } else {
            console.log("No room id");
          }
        } else {
          // Send the data to the players
          socket.data.roomId &&
            socket.to(socket.data.roomId).emit("game-data", {
              board: [],
              availableMoves: [],
              nextMoveSocketId: "",
              size: 0,
            });
          socket.emit("game-data", {
            board: [],
            availableMoves: [],
            nextMoveSocketId: "",
            size: 0,
          });

          // Remove the room
          socket.data.roomId &&
            io.sockets.adapter.rooms.delete(socket.data.roomId);
        }
      });

      socket.on("leave-room", () => {
        // Send request to the other player
        socket.data.roomId && socket.to(socket.data.roomId).emit("left");

        // Remove the room
        socket.data.roomId &&
          io.sockets.adapter.rooms.delete(socket.data.roomId);

        // Remove the data
        socket.data.roomId && gameData.delete(socket.data.roomId);

        // Remove the room id from the socket
        socket.data.roomId = "";
      });

      socket.on("disconnect", () => {
        // Send request to the other player
        socket.data.roomId && socket.to(socket.data.roomId).emit("left");
      });

      // TODO: TEMPORARY
      socket.on("message", (message) => {
        // Send the message to the room
        socket.data.roomId &&
          socket.to(socket.data.roomId).emit("message", message);
      });
    });
  }
  res.end();
};

export default SocketHandler;

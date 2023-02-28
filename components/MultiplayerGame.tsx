import { useState, useEffect } from "react";
import { Socket, io } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "../types/socket";
import shortid from "shortid";
import { useConfirmStore } from "../stores/confirm";
import { usePopupStore } from "../stores/popup";

let socket: Socket<ServerToClientEvents, ClientToServerEvents>;
let socketId: string;
let roomId: string;

export function MultiplayerGame() {
  const [board, setBoard] = useState<string[][]>();
  const [availableMoves, setAvailableMoves] = useState<number[]>();
  const [nextMoveSocketId, setNextMoveSocketId] = useState<string | null>(null);
  const [size, setSize] = useState<number>(3);

  const [roomIdInput, setRoomIdInput] = useState("");
  const [createRoom, setCreateRoom] = useState(shortid.generate());
  const [message, setMessage] = useState("");
  const [roomStatus, setRoomStatus] = useState<
    "Waiting" | "RequestWaiting" | null
  >(null);

  const openConfirm = useConfirmStore((state) => state.openPopup);
  const openPopup = usePopupStore((state) => state.openPopup);

  useEffect(() => {
    initializeSocket();
  }, []);

  // If the board is null then set the room status to null
  useEffect(() => {
    if (!board) {
      setRoomStatus(null);
    }
  }, [board]);

  const initializeSocket = async () => {
    await fetch("/api/socket");
    socket = io();

    socket.on("connect", () => {
      console.log("Connected to server");

      // socket.emit("setup", "Shanto");
      // Check if the username is saved in the local storage
      const usernameFromStorage = localStorage.getItem("username");
      if (usernameFromStorage) {
        socket.emit("set-username", usernameFromStorage);
      } else {
        const usernameFromPrompt = prompt("Enter your username");
        if (usernameFromPrompt) {
          socket.emit("set-username", usernameFromPrompt);
          localStorage.setItem("username", usernameFromPrompt);
        }
      }

      socket.on("set-socketId", (id) => {
        socketId = id;
      });

      socket.on("room-created", (roomIdd) => {
        roomId = roomIdd;
        setRoomStatus("Waiting");
      });

      socket.on("room-error", (errorType) => {
        switch (errorType) {
          case "ALREADY_JOINED":
            openPopup("You have already joined a room");
            setRoomStatus(null);
            break;

          case "ALREADY_EXISTS":
            openPopup("Room already exists");
            setRoomStatus(null);
            break;

          case "NOTFOUND":
            openPopup("Room not found");
            setRoomStatus(null);
            break;
          case "FULL":
            openPopup("Room is full");
            setRoomStatus(null);
            break;
        }
      });

      socket.on("join-request-sent", () => {
        setRoomStatus("RequestWaiting");
      });

      socket.on("join-request-to-owner", (username: string, socketIdd) => {
        openConfirm(
          `${username} wants to play with you`,
          () => {
            socket.emit("join-response-from-owner", {
              accept: true,
              socketId: socketIdd,
            });
          },
          () => {
            socket.emit("join-response-from-owner", {
              accept: false,
              socketId: socketIdd,
            });
          }
        );
      });

      socket.on("join-response", (data) => {
        if (data.accept) {
          socket.emit("add-me", data.roomId);
        } else {
          openPopup("Your request was rejected");
          setRoomStatus(null);
        }
      });

      socket.on("message", (message) => {
        alert(message);
      });

      socket.on("game-data", (data) => {
        setBoard(data.board);
        setAvailableMoves(data.availableMoves);
        setNextMoveSocketId(data.nextMoveSocketId);
        setSize(data.size);
      });

      socket.on("game-over", (winner) => {
        if (winner) {
          if (winner === socketId) {
            openConfirm(
              "You won! Do you want to play again?",
              () => {
                socket.emit("play-again");
              },
              () => {
                socket.emit("leave-room");
              }
            );
          } else {
            openConfirm(
              "You lost! Do you want to play again?",
              () => {
                socket.emit("play-again");
              },
              () => {
                socket.emit("leave-room");
              }
            );
          }
        } else {
          openConfirm(
            "It's a draw! Do you want to play again?",
            () => {
              socket.emit("play-again");
            },
            () => {
              socket.emit("leave-room");
            }
          );
        }
      });
    });

    socket.on("play-again-request", () => {
      openConfirm(
        "Your opponent wants to play again",
        () => {
          socket.emit("play-again-response", true);
        },
        () => {
          socket.emit("play-again-response", false);
        }
      );
    });

    socket.on("play-again-response", (response) => {
      if (!response) {
        openPopup("Your opponent rejected your request", () => {
          window.location.reload();
        });
      }
    });

    socket.on("left", () => {
      openPopup("Your opponent left the game", () => {
        window.location.reload();
      });
    });
  };

  if (!board) {
    if (roomStatus === "Waiting") {
      return (
        <div id="waiting">
          <h2 className="heading-text">Waiting for opponent</h2>
          <div className="room-id">
            <p className="text">Id of the room</p>
            <p className="id">{roomId}</p>
            <div className="share">
              <button
                className="btn blue"
                onClick={() => {
                  navigator.clipboard.writeText(roomId);
                }}
              >
                Copy Id
              </button>

              <button
                className="btn blue"
                onClick={() => {
                  // TODO: implement this
                  navigator.clipboard.writeText(
                    `${window.location.origin}/multiplayer?roomId=${roomId}`
                  );
                }}
              >
                Copy Link
              </button>

              <button
                className="btn red"
                onClick={() => {
                  socket.emit("leave-room");
                  setRoomStatus(null);
                }}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      );
    } else if (roomStatus === "RequestWaiting") {
      return (
        <div id="request-waiting">
          <h2 className="heading-text">Waiting for response</h2>
          <button
            className="btn red"
            onClick={() => {
              window.location.reload();
            }}
          >
            Leave
          </button>
        </div>
      );
    } else {
      return (
        <div id="room-join">
          <div className="request form">
            <h2 className="text">Join a room</h2>
            <input
              type="text"
              placeholder="Enter room id"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
            />
            <button
              className="btn green"
              onClick={() => {
                socket.emit("join-request", roomIdInput);
              }}
            >
              Request
            </button>
          </div>

          <div className="create-room form">
            <h2 className="text">Create a room</h2>
            <input
              type="text"
              placeholder="Choose a name or id"
              value={createRoom}
              onChange={(e) => setCreateRoom(e.target.value)}
            />
            <button
              className="btn green"
              onClick={() => {
                socket.emit("create-room", createRoom);
              }}
            >
              Create Room
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <>
      <div id="game">
        <div className="header">
          <div className="info">
            <h3>
              You are <span className="user">{"Y"}</span>
            </h3>
            <h3>
              Computer is <span className="opponent">{"O"}</span>
            </h3>
          </div>

          <div className="right-header">
            <div className="message">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                onClick={() => {
                  socket.emit("message", message);
                }}
              >
                Send
              </button>
            </div>

            <div>
              <button
                className="play-button restart"
                onClick={() => window.location.reload()}
              >
                Restart
              </button>
            </div>
          </div>
        </div>

        <div className={`board`}>
          {size &&
            board &&
            availableMoves &&
            board.map((row, rowIndex) => (
              <div className="row" key={rowIndex}>
                {row.map((cell, cellIndex) => {
                  const disabled =
                    !availableMoves.includes(rowIndex * size + cellIndex) ||
                    nextMoveSocketId !== socketId;

                  const cellClassName = `cell ${
                    cell === socketId ? "user" : cell === "" ? "" : "opponent"
                  } ${disabled ? "disabled" : ""} cell-size-${size}`;

                  return (
                    <button
                      className={cellClassName}
                      key={cellIndex}
                      onClick={() => {
                        if (disabled) return;
                        socket.emit("make-move", {
                          rowIndex,
                          cellIndex,
                        });
                      }}
                      disabled={disabled}
                    >
                      {cell === socketId ? "Y" : cell === "" ? "" : "O"}
                    </button>
                  );
                })}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

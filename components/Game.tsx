import { useState, useEffect } from "react";
import ResultPopup from "./ResultPopup";
import {
  USER_VALUE,
  COMPUTER_VALUE,
  BOARD_DEFAULT,
  LOGS_NAME,
  DRAW_VALUE,
  MIN,
  MAX,
} from "../constants/game";

// Save the log to the local storage  [[time, winner], [time, winner], ...]
function saveHistory(winner: string | number) {
  // get the log if it exists
  const history = localStorage.getItem(LOGS_NAME);
  if (history) {
    // parse it to JSON
    const parsedLogs = JSON.parse(history);
    // push (time, winner) to the history
    parsedLogs.push([new Date().toLocaleString(), winner]);
    // set the history to the local storage
    localStorage.setItem(LOGS_NAME, JSON.stringify(parsedLogs));
  } else {
    // if the history doesn't exist, create it with the first (time, winner)
    localStorage.setItem(LOGS_NAME, JSON.stringify([[new Date(), winner]]));
  }
}

// The game component
// This component is responsible for the game logic
// It will be a random grid.
// The grid will be randomly generated when the component is mounted.
// It can be 3x3, 4x4, 5x5, 6x6 min: MINxMIN, max: MAXxMAX
// After the user moves the computer will move randomly
// Select the first move randomly
// TODO: Add AI
// TODO: refactor the code
export function Game() {
  // The size of the grid.
  // NOTE that if we initially set any random value, it throws `React Hydration Error` error.
  // So we set the default value to null and then when the component is mounted, we set the value to a random number.
  const [size, setSize] = useState<number | null>(null);
  // Is the next move for the user?
  // First time it will be randomlly selected
  // This component depends on the `size` state.
  // So initially it will be null. But when the `size` state is set, it will be set to `false`
  const [nextMoveUser, setNextMoveUser] = useState<boolean | null>(null);
  // Who is the winner?
  // null: no winner yet
  // DRAW_VALUE: Draw,
  // USER_VALUE: User,
  // COMPUTER_VALUE: Computer
  const [winner, setWinner] = useState<null | string>(null);
  // The board state
  // It will be a random x random array. min: 3, max: 8
  // Each cell will have a value with either USER_VALUE, COMPUTER_VALUE or BOARD_DEFAULT
  // At the beginning all cells will have BOARD_DEFAULT
  // After when the user or the computer moves the cell will have USER_VALUE or COMPUTER_VALUE
  // This component depends on the `size` state.
  // So initially it will be null. But when the `size` state is set, it will be set to a string[][] array
  const [board, setBoard] = useState<string[][] | null>(null);
  // Available moves
  // After anyone moves, the move's cell's index will be removed from the available moves
  // It depends on the `size` state.
  // So initially it will be null. But when the `size` state is set, it will be set to a number[] array
  const [availableMoves, setAvailableMoves] = useState<number[] | null>(null);

  useEffect(() => {
    // random size
    const size = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    setSize(size);
  }, []);

  useEffect(() => {
    if (size) {
      // Create the board
      const newBoard = [];
      for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
          row.push(BOARD_DEFAULT);
        }
        newBoard.push(row);
      }
      setBoard(newBoard);

      // Create the available moves
      const newAvailableMoves = [];
      for (let i = 0; i < size * size; i++) {
        newAvailableMoves.push(i);
      }
      setAvailableMoves(newAvailableMoves);

      // Select the first move randomly
      setNextMoveUser(Math.random() >= 0.5);
    }
  }, [size]);

  // When anyone wins
  useEffect(() => {
    if (winner !== null) {
      // remove the available moves
      setAvailableMoves([]);

      // save the log
      saveHistory(winner);
    }
  }, [winner]);

  // When the available is empty, it means that the game is draw
  useEffect(() => {
    if (availableMoves !== null && availableMoves.length === 0) {
      // If still no winner, set the winner to 0 (draw)
      if (!winner) {
        setWinner(DRAW_VALUE);
      }
    }
  }, [availableMoves]);

  // If the next move is not for the user, then the computer will move
  useEffect(() => {
    if (winner === null && !nextMoveUser && availableMoves && board && size) {
      const randomIndex = Math.floor(Math.random() * availableMoves.length);
      const randomMove = availableMoves[randomIndex];
      const newBoard = board.map((row, rowIndex) =>
        row.map((cell, cellIndex) => {
          // if the cell is the random move, return the computer value
          // otherwise return the cell
          return rowIndex * size + cellIndex === randomMove
            ? COMPUTER_VALUE
            : cell;
        })
      );
      setBoard(newBoard);
      setAvailableMoves(availableMoves.filter((move) => move !== randomMove));
      checkWinner(newBoard);
      setNextMoveUser(true);
    }
  }, [nextMoveUser]);

  // detect if anyone won when the board changes
  const checkWinner = (newBoard: string[][]) => {
    // check rows
    for (let i = 0; i < newBoard.length; i++) {
      const row = newBoard[i];
      if (row[0] !== BOARD_DEFAULT && row.every((cell) => cell === row[0])) {
        setWinner(row[0]);
        return;
      }
    }

    // check columns
    for (let i = 0; i < newBoard.length; i++) {
      const column = newBoard.map((row) => row[i]);
      if (
        column[0] !== BOARD_DEFAULT &&
        column.every((cell) => cell === column[0])
      ) {
        setWinner(column[0]);
        return;
      }
    }

    // check diagonals (left to right)
    const diagonalLeftToRight = newBoard.map((row, index) => row[index]);
    if (
      diagonalLeftToRight[0] !== BOARD_DEFAULT &&
      diagonalLeftToRight.every((cell) => cell === diagonalLeftToRight[0])
    ) {
      setWinner(diagonalLeftToRight[0]);
      return;
    }

    // check diagonals (right to left)
    const diagonalRightToLeft = newBoard.map(
      (row, index) => row[newBoard.length - 1 - index]
    );
    if (
      diagonalRightToLeft[0] !== BOARD_DEFAULT &&
      diagonalRightToLeft.every((cell) => cell === diagonalRightToLeft[0])
    ) {
      setWinner(diagonalRightToLeft[0]);
      return;
    }
  };

  // When the user clicks on a cell
  const onClick = (rowIndex: number, colIndex: number) => {
    if (nextMoveUser && availableMoves && board && size) {
      // Check if the move is available
      if (availableMoves.includes(rowIndex * size + colIndex)) {
        const newBoard = [...board];
        newBoard[rowIndex][colIndex] = USER_VALUE;
        setBoard(newBoard);
        setAvailableMoves(
          availableMoves.filter((move) => move !== rowIndex * size + colIndex)
        );
        checkWinner(newBoard);
        setNextMoveUser(false);
      }
    }
  };

  return (
    <>
      {winner != null ? <ResultPopup winner={winner} /> : <></>}

      <div className="game">
        <div className="header">
          <div className="info">
            <h3>
              You are <span className="user">{USER_VALUE}</span>
            </h3>
            <h3>
              Computer is <span className="opponent">{COMPUTER_VALUE}</span>
            </h3>
          </div>

          <div>
            <button
              className="btn green"
              onClick={() => window.location.reload()}
            >
              Restart
            </button>
          </div>
        </div>

        <div
          className={`board ${
            winner === USER_VALUE
              ? "user"
              : winner === COMPUTER_VALUE
              ? "opponent"
              : ""
          }`}
        >
          {size &&
            board &&
            availableMoves &&
            board.map((row, rowIndex) => (
              <div className="row" key={rowIndex}>
                {row.map((cell, cellIndex) => {
                  const cellClassName = `cell ${
                    cell === USER_VALUE
                      ? "user"
                      : cell === COMPUTER_VALUE
                      ? "opponent"
                      : ""
                  } ${
                    // disable or not
                    availableMoves.includes(rowIndex * size + cellIndex)
                      ? ""
                      : "disabled"
                  } cell-size-${size}`;

                  return (
                    <button
                      className={cellClassName}
                      key={cellIndex}
                      onClick={() => onClick(rowIndex, cellIndex)}
                      disabled={
                        // Check if cell is in available moves
                        !availableMoves.includes(rowIndex * size + cellIndex)
                      }
                    >
                      {cell}
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

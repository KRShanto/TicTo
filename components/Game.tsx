import { useState, useEffect } from "react";
import ResultPopup from "./ResultPopup";
import { USER_VALUE, COMPUTER_VALUE, BOARD_DEFAULT, LOGS_NAME } from "../pages";

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
// It will be a 3x3 grid
// After the user moves the computer will move randomly
// Select the first move randomly
export function Game() {
    // Is the next move for the user?
    // First time it will be randomlly selected
    const [nextMoveUser, setNextMoveUser] = useState(Math.random() > 0.5);
    // Who is the winner?
    // null: no winner yet
    // 0: Draw,
    // USER_VALUE: User,
    // COMPUTER_VALUE: Computer
    const [winner, setWinner] = useState<null | string | number>(null);
    // The board state
    // It will be a 3x3 array
    // Each cell will have a value with either USER_VALUE, COMPUTER_VALUE or BOARD_DEFAULT
    // At the beginning all cells will have BOARD_DEFAULT
    // After when the user or the computer moves the cell will have USER_VALUE or COMPUTER_VALUE
    const [board, setBoard] = useState([
        [BOARD_DEFAULT, BOARD_DEFAULT, BOARD_DEFAULT],
        [BOARD_DEFAULT, BOARD_DEFAULT, BOARD_DEFAULT],
        [BOARD_DEFAULT, BOARD_DEFAULT, BOARD_DEFAULT],
    ]);
    // Available moves
    // After anyone moves, the move's cell's index will be removed from the available moves
    const [availableMoves, setAvailableMoves] = useState([
        0, 1, 2, 3, 4, 5, 6, 7, 8,
    ]);

    // When anyone wins, remove the available moves
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
        if (availableMoves.length === 0) {
            // If still no winner, set the winner to 0 (draw)
            if (!winner) {
                setWinner(0);
            }
        }
    }, [availableMoves]);

    // If the next move is not for the user, then the computer will move
    useEffect(() => {
        if (winner === null && !nextMoveUser) {
            const randomIndex = Math.floor(
                Math.random() * availableMoves.length
            );
            const randomMove = availableMoves[randomIndex];
            const newBoard = board.map((row, rowIndex) =>
                row.map((cell, cellIndex) => {
                    if (rowIndex * 3 + cellIndex === randomMove) {
                        return COMPUTER_VALUE;
                    }
                    return cell;
                })
            );
            setBoard(newBoard);
            setAvailableMoves(
                availableMoves.filter((move) => move !== randomMove)
            );
            checkWinner(newBoard);
            setNextMoveUser(true);
        }
    }, [nextMoveUser]);

    // detect if anyone won when the board changes
    // useEffect(() => {
    const checkWinner = (newBoard: string[][]) => {
        // check rows
        for (let i = 0; i < newBoard.length; i++) {
            const row = newBoard[i];
            if (
                row[0] === row[1] &&
                row[1] === row[2] &&
                row[0] !== BOARD_DEFAULT
            ) {
                setWinner(row[0]);
                return;
            }
        }

        // check columns
        for (let i = 0; i < newBoard.length; i++) {
            const column = newBoard.map((row) => row[i]);
            if (
                column[0] === column[1] &&
                column[1] === column[2] &&
                column[0] !== BOARD_DEFAULT
            ) {
                setWinner(column[0]);
                return;
            }
        }

        // check diagonals
        const diagonal1 = newBoard.map((row, index) => row[index]);
        if (
            diagonal1[0] === diagonal1[1] &&
            diagonal1[1] === diagonal1[2] &&
            diagonal1[0] !== BOARD_DEFAULT
        ) {
            setWinner(diagonal1[0]);
            return;
        }

        const diagonal2 = newBoard.map(
            (row, index) => row[newBoard.length - 1 - index]
        );
        if (
            diagonal2[0] === diagonal2[1] &&
            diagonal2[1] === diagonal2[2] &&
            diagonal2[0] !== BOARD_DEFAULT
        ) {
            setWinner(diagonal2[0]);
            return;
        }
        // }, [board]);
    };

    // When the user clicks on a cell
    const onClick = (rowIndex: number, colIndex: number) => {
        if (nextMoveUser) {
            // Check if the move is available
            if (availableMoves.includes(rowIndex * 3 + colIndex)) {
                const newBoard = [...board];
                newBoard[rowIndex][colIndex] = USER_VALUE;
                setBoard(newBoard);
                setAvailableMoves(
                    availableMoves.filter(
                        (move) => move !== rowIndex * 3 + colIndex
                    )
                );
                checkWinner(newBoard);
                setNextMoveUser(false);
            }
        }
    };

    return (
        <>
            {winner != null ? <ResultPopup winner={winner} /> : <></>}

            <div className="info-value">
                <h3>
                    You are <span className="user">{USER_VALUE}</span>
                </h3>
                <h3>
                    Computer is{" "}
                    <span className="computer">{COMPUTER_VALUE}</span>
                </h3>
            </div>

            <div
                className={`board ${
                    winner === USER_VALUE
                        ? "user"
                        : winner === COMPUTER_VALUE
                        ? "computer"
                        : ""
                }`}
            >
                {board.map((row, rowIndex) => (
                    <div className="row" key={rowIndex}>
                        {row.map((cell, cellIndex) => {
                            const cellClassName = `cell ${
                                cell === USER_VALUE
                                    ? "user"
                                    : cell === COMPUTER_VALUE
                                    ? "computer"
                                    : ""
                            } ${
                                // disable or not
                                availableMoves.includes(
                                    rowIndex * 3 + cellIndex
                                )
                                    ? ""
                                    : "disabled"
                            }`;

                            return (
                                <button
                                    className={cellClassName}
                                    key={cellIndex}
                                    onClick={() => onClick(rowIndex, cellIndex)}
                                    disabled={
                                        // Check if cell is in available moves
                                        !availableMoves.includes(
                                            rowIndex * 3 + cellIndex
                                        )
                                    }
                                >
                                    {cell}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </>
    );
}

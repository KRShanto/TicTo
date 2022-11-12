import { useState, useEffect } from "react";
import ResultPopup from "./ResultPopup";
import { USER_VALUE, COMPUTER_VALUE, BOARD_DEFAULT, LOGS_NAME } from "../pages";

export function Game() {
    // It will be a 3x3 grid
    // After the user moves the computer will move randomly
    // Select the first move randomly
    // The user is X, the computer is O
    const [nextMoveUser, setIsNextMoveUser] = useState(Math.random() > 0.5);
    const [winner, setWinner] = useState<null | string | number>(null);
    const [board, setBoard] = useState([
        [BOARD_DEFAULT, BOARD_DEFAULT, BOARD_DEFAULT],
        [BOARD_DEFAULT, BOARD_DEFAULT, BOARD_DEFAULT],
        [BOARD_DEFAULT, BOARD_DEFAULT, BOARD_DEFAULT],
    ]);
    const [availableMoves, setAvailableMoves] = useState([
        0, 1, 2, 3, 4, 5, 6, 7, 8,
    ]);

    // When anyone wins, remove the available moves
    useEffect(() => {
        if (winner !== null) {
            setAvailableMoves([]);
            // save the info the local storage // [(time, winner), (time, winner), ...]
            // TODO show the info in the logs page
            const logs = localStorage.getItem(LOGS_NAME);
            if (logs) {
                const parsedLogs = JSON.parse(logs);
                parsedLogs.push([new Date(), winner]);
                localStorage.setItem(LOGS_NAME, JSON.stringify(parsedLogs));
            } else {
                localStorage.setItem(
                    LOGS_NAME,
                    JSON.stringify([[new Date(), winner]])
                );
            }
        }
    }, [winner]);

    // When the available is empty, it means that the game is draw
    useEffect(() => {
        if (availableMoves.length === 0) {
            if (!winner) {
                setWinner(0);
            }
        }
    }, [availableMoves]);

    // If the next move is not for the user, then the computer will move
    useEffect(() => {
        if (!nextMoveUser) {
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
            setIsNextMoveUser(true);
        }
    }, [nextMoveUser]);

    // detect if anyone won
    useEffect(() => {
        // check rows
        for (let i = 0; i < board.length; i++) {
            const row = board[i];
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
        for (let i = 0; i < board.length; i++) {
            const column = board.map((row) => row[i]);
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
        const diagonal1 = board.map((row, index) => row[index]);
        if (
            diagonal1[0] === diagonal1[1] &&
            diagonal1[1] === diagonal1[2] &&
            diagonal1[0] !== BOARD_DEFAULT
        ) {
            setWinner(diagonal1[0]);
            return;
        }

        const diagonal2 = board.map(
            (row, index) => row[board.length - 1 - index]
        );
        if (
            diagonal2[0] === diagonal2[1] &&
            diagonal2[1] === diagonal2[2] &&
            diagonal2[0] !== BOARD_DEFAULT
        ) {
            setWinner(diagonal2[0]);
            return;
        }
    }, [board]);

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
                setIsNextMoveUser(false);
            } else {
                console.warn("Move not available");
            }
        } else {
            console.warn("It's not your turn");
        }
    };

    return (
        <>
            {winner != null ? <ResultPopup winner={winner} /> : <></>}

            <h3>You are X</h3>
            <h3>Computer is O</h3>

            <div className="board">
                {board.map((row, rowIndex) => (
                    <div className="row" key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                            <button
                                className="cell"
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
                        ))}
                    </div>
                ))}
            </div>
        </>
    );
}

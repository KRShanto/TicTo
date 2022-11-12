import Head from "next/head";
import { useState, useEffect } from "react";
import { COMPUTER_VALUE, LOGS_NAME, USER_VALUE } from ".";

export default function History() {
    const [history, setHistory] = useState([]);
    const [won, setWon] = useState(0);
    const [lost, setLost] = useState(0);
    const [draw, setDraw] = useState(0);

    // get the history from the local storage
    useEffect(() => {
        const logs = localStorage.getItem(LOGS_NAME);
        if (logs) {
            setHistory(JSON.parse(logs));
        }
    }, []);

    // count the won, lost and draw
    useEffect(() => {
        let won = 0;
        let lost = 0;
        let draw = 0;
        history.forEach((log) => {
            if (log[1] === USER_VALUE) {
                won++;
            } else if (log[1] === COMPUTER_VALUE) {
                lost++;
            } else {
                draw++;
            }
        });
        setWon(won);
        setLost(lost);
        setDraw(draw);
    }, [history]);

    return (
        <>
            <Head>
                <title>TicTo | History</title>
            </Head>

            <div className="history">
                <h1 className="title">Your Score</h1>
                <div className="score">
                    <p className="win">
                        You won <b>{won}</b> times
                    </p>
                    <p className="lose">
                        You lost <b>{lost}</b> times
                    </p>
                    <p className="draw">
                        You drew <b>{draw}</b> times
                    </p>
                </div>

                <h1 className="title">Your game history</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Winner</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((log, i) => (
                            <tr
                                key={i}
                                className={
                                    log[1] === 0
                                        ? "draw"
                                        : log[1] === "X"
                                        ? "user"
                                        : "computer"
                                }
                            >
                                <td className="time">{log[0]}</td>
                                <td className="winner">
                                    {log[1] === 0
                                        ? "Draw"
                                        : log[1] === "X"
                                        ? "User"
                                        : "Computer"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

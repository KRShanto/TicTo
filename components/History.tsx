import { useState, useEffect } from "react";
import { COMPUTER_VALUE, LOGS_NAME, USER_VALUE, DRAW_VALUE } from "../pages";

export default function History() {
    const [history, setHistory] = useState([]);
    const [won, setWon] = useState(0);
    const [lost, setLost] = useState(0);
    const [draw, setDraw] = useState(0);

    // get the history from the local storage
    useEffect(() => {
        const logs = localStorage.getItem(LOGS_NAME);

        if (logs) {
            // parse it into json
            let jsonLog = JSON.parse(logs);

            // sort the history by date and time
            let jsonLogSorted = jsonLog.sort((a: any, b: any) => {
                return new Date(b[0]).getTime() - new Date(a[0]).getTime();
            });

            setHistory(jsonLogSorted);
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
        <div className="history">
            <h1 className="title">Your Score</h1>
            <div className="score">
                <p className="total-matches">
                    Total Matches: <b>{history.length}</b>
                </p>
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
                                log[1] === DRAW_VALUE
                                    ? "draw"
                                    : log[1] === USER_VALUE
                                    ? "user"
                                    : "computer"
                            }
                        >
                            <td className="time">{log[0]}</td>
                            <td className="winner">
                                {log[1] == DRAW_VALUE
                                    ? "Draw"
                                    : log[1] === USER_VALUE
                                    ? "User"
                                    : "Computer"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

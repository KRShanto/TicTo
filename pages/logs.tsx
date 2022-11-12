import { useState, useEffect } from "react";
import { LOGS_NAME } from "../pages";

export default function Logs() {
    const [logs, setLogs] = useState([]);
    useEffect(() => {
        const logs = localStorage.getItem(LOGS_NAME);
        if (logs) {
            setLogs(JSON.parse(logs));
        }
    }, []);
    return (
        <div>
            <h1>Logs</h1>
            <table>
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Winner</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <tr>
                            <td>{log[0]}</td>
                            <td>
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
    );
}

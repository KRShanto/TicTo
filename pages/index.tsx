import Head from "next/head";
import { useState } from "react";
import { Game } from "../components/Game";

export const USER_VALUE = "X";
export const COMPUTER_VALUE = "O";
export const BOARD_DEFAULT = "1";
export const LOGS_NAME = "Ticto-Logs";

export default function Home() {
    const [isStarted, setIsStarted] = useState(false);

    return (
        <>
            <Head>
                <title>Ticto</title>
                <meta name="description" content="Play Tic Tac Toe game" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <h1 className="title">Ticto</h1>
                <p>Play Tic Tac Toe game</p>

                {isStarted ? (
                    <Game />
                ) : (
                    <button onClick={() => setIsStarted(true)}>Start</button>
                )}
            </main>
        </>
    );
}

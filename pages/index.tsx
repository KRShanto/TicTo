import Head from "next/head";
import Link from "next/link";

export const USER_VALUE = "X";
export const COMPUTER_VALUE = "O";
export const BOARD_DEFAULT = "";
export const LOGS_NAME = "Ticto-Logs";

export default function Home() {
    return (
        <>
            <Head>
                <title>TicTo</title>
                <meta name="description" content="Play Tic Tac Toe game" />
                {/* <meta
                    content="width=device-width, initial-scale=1"
                    name="viewport"
                /> */}
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <>
                    <div className="play">
                        <h1 className="play-text">Play Tic Tac Toe game</h1>
                        <Link className="play-button start" href="/game">
                            Start
                        </Link>
                    </div>
                </>
            </main>
        </>
    );
}

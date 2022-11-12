import Head from "next/head";
import { Game } from "../components/Game";

export default function GamePage() {
    return (
        <>
            <Head>
                <title>TicTo | Play the game</title>
            </Head>

            <Game />
        </>
    );
}

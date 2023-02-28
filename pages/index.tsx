import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import ComputerIcon from "../public/computer.svg";
import FriendsIcon from "../public/friend.svg";

const ICON_SIZE = 30;

export default function Home() {
  return (
    <>
      <Head>
        <title>TicTo</title>
        <meta name="description" content="Play Tic Tac Toe game" />
        <link rel="icon" href="/TicTo-logo.svg" />
      </Head>

      <main>
        <>
          <div className="play">
            <h1 className="play-text">Play Tic Tac Toe game</h1>
            <Link className="btn green" href="/game">
              <p className="text">Play with computer</p>
              <Image
                src={ComputerIcon}
                alt="computer"
                width={ICON_SIZE}
                height={ICON_SIZE}
              />
            </Link>
            <Link className="btn green" href="/multiplayer">
              <p className="text">Play with friends</p>
              <Image
                src={FriendsIcon}
                alt="friends"
                width={ICON_SIZE}
                height={ICON_SIZE}
              />
            </Link>
          </div>
        </>
      </main>
    </>
  );
}

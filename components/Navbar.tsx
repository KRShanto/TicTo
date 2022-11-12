import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
    const router = useRouter();

    return (
        <nav>
            <h1 className="logo">TicTo</h1>

            <div className="links">
                <Link
                    href="/"
                    className={router.pathname === "/" ? "active" : ""}
                >
                    Home
                </Link>
                <Link
                    href="/game"
                    className={router.pathname === "/game" ? "active" : ""}
                >
                    Game
                </Link>
                <Link
                    href="/history"
                    className={router.pathname === "/history" ? "active" : ""}
                >
                    History
                </Link>
            </div>
        </nav>
    );
}

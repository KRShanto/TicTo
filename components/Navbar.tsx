import { useMediaQuery } from "react-responsive";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
    const [linksActive, setLinksActive] = useState(false);
    const [isResponsiveWidth, setIsResponsiveWidth] = useState<null | boolean>(
        null
    );
    const [imgUrl, setImgUrl] = useState("/menu.svg");
    const router = useRouter();
    const media = useMediaQuery({
        query: "(max-width: 600px)",
    });

    function toggleLinksClass() {
        setLinksActive(!linksActive);
    }

    useEffect(() => {
        setLinksActive(false);
    }, [router]);

    useEffect(() => {
        setIsResponsiveWidth(media);
    }, [media]);

    useEffect(() => {
        if (linksActive) {
            setImgUrl("/cross.svg");
        } else {
            setImgUrl("/menu.svg");
        }
    }, [linksActive]);

    return (
        <nav>
            <Link className="logo" href="/">
                <img
                    src="/TicTo-logo.svg"
                    alt="Website logo"
                    width={50}
                    height={50}
                />

                <h1 className="title">TicTo</h1>
            </Link>

            <div className="links-div">
                {isResponsiveWidth ? (
                    // hamburger menu
                    <div className="menu" onClick={() => toggleLinksClass()}>
                        <img
                            src={imgUrl}
                            width={30}
                            height={30}
                            alt="Menu icon"
                        />
                    </div>
                ) : (
                    <></>
                )}

                {isResponsiveWidth !== null ? (
                    <div
                        className={`links ${
                            isResponsiveWidth === true ? "responsive" : ""
                        } ${linksActive ? "active" : ""}`}
                    >
                        <Link
                            href="/"
                            className={router.pathname === "/" ? "active" : ""}
                        >
                            Home
                        </Link>
                        <Link
                            href="/game"
                            className={
                                router.pathname === "/game" ? "active" : ""
                            }
                        >
                            Game
                        </Link>
                        <Link
                            href="/history"
                            className={
                                router.pathname === "/history" ? "active" : ""
                            }
                        >
                            History
                        </Link>
                        <Link
                            href="https://github.com/KRShanto/TicTo"
                            target="_blank"
                        >
                            Github
                        </Link>
                    </div>
                ) : (
                    <></>
                )}
            </div>
        </nav>
    );
}

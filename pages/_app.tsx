import "../styles/globals.scss";
import type { AppProps } from "next/app";
import Navbar from "../components/Navbar";
import { Analytics } from "@vercel/analytics/react";
import Confirm from "../components/Confirm";
import Popup from "../components/Popup";
import { useConfirmStore } from "../stores/confirm";
import { usePopupStore } from "../stores/popup";

// TODO: Email feature: invite friends to play
export default function App({ Component, pageProps }: AppProps) {
  const openConfirm = useConfirmStore((state) => state.open);
  const openPopup = usePopupStore((state) => state.open);

  return (
    <>
      {openConfirm && <Confirm />}
      {openPopup && <Popup />}

      <Navbar />
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}

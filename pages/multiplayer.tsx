import React from "react";
import Head from "next/head";
import { MultiplayerGame } from "../components/MultiplayerGame";

export default function MultiplayerGamePage() {
  return (
    <>
      <Head>
        <title>TicTo | Play with friends</title>
      </Head>

      <MultiplayerGame />
    </>
  );
}

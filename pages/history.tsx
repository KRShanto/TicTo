import Head from "next/head";
import History from "../components/History";

export default function HistoryPage() {
    return (
        <>
            <Head>
                <title>TicTo | History</title>
            </Head>

            <History />
        </>
    );
}

type ResultPopupProps = {
    winner: string | number;
};

export default function ResultPopup({ winner }: ResultPopupProps) {
    if (winner == 0) {
        return (
            <div>
                <h2>Draw</h2>
                <button onClick={() => window.location.reload()}>
                    Play again
                </button>
            </div>
        );
    }

    return (
        <div>
            <h2>{winner} won!</h2>
            <button onClick={() => window.location.reload()}>Play again</button>
        </div>
    );
}

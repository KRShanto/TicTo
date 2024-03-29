import { USER_VALUE, DRAW_VALUE } from "../constants/game";

type ResultPopupProps = {
  winner: string | number;
};

// Popup component that shows the winner
export default function ResultPopup({ winner }: ResultPopupProps) {
  // if winner is a number, it means draw. Nobody won
  if (winner == DRAW_VALUE) {
    return (
      <div className="result-popup draw">
        <h2 className="text">Game Draw</h2>
        <button className="btn green" onClick={() => window.location.reload()}>
          Play again
        </button>
      </div>
    );
  }

  // if winner is a string, it means someone won
  // either user or computer
  return (
    <div
      className={`result-popup ${winner === USER_VALUE ? "user" : "computer"}`}
    >
      <h2 className="text">
        {winner === USER_VALUE ? "You" : "Computer"} won!
      </h2>
      <button className="btn green" onClick={() => window.location.reload()}>
        Play again
      </button>
    </div>
  );
}

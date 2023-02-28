export default interface GameData {
  board: string[][];
  availableMoves: number[];
  nextMoveSocketId: string;
  size: number;
}

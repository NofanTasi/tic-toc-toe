export type Player = 'X' | 'O';
export type CellState = Player | null;
export type BoardState = CellState[];

export type LineType = 'row' | 'col' | 'diag';

export interface Line {
  id: string;
  name: string;
  indices: [number, number, number];
  type: LineType;
}

export type GameMode = 'pvp' | 'pva_x' | 'pva_o' | 'ava';

export type GameStatus = 'in_progress' | 'win_x' | 'win_o';

export interface MoveHistoryItem {
  id: string;
  turn: Player;
  action: 'place' | 'clear';
  cellIndex?: number;
  lineCleared?: Line;
  boardBefore: BoardState;
  boardAfter: BoardState;
  timestamp: number;
}

export interface CanonicalMatch {
  classNumber: number;
  className: string;
  canonicalBoard: string;
  transformIndex: number;
  safeLineIds: string[];
}

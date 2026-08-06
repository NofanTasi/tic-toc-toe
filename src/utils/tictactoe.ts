import { BoardState, Line, Player, CanonicalMatch } from '../types';

export const LINES: Line[] = [
  { id: 'row-1', name: 'Row 1 (Top)', indices: [0, 1, 2], type: 'row' },
  { id: 'row-2', name: 'Row 2 (Middle)', indices: [3, 4, 5], type: 'row' },
  { id: 'row-3', name: 'Row 3 (Bottom)', indices: [6, 7, 8], type: 'row' },
  { id: 'col-1', name: 'Col 1 (Left)', indices: [0, 3, 6], type: 'col' },
  { id: 'col-2', name: 'Col 2 (Center)', indices: [1, 4, 7], type: 'col' },
  { id: 'col-3', name: 'Col 3 (Right)', indices: [2, 5, 8], type: 'col' },
  { id: 'diag-main', name: 'Main Diag ( top-left to bot-right )', indices: [0, 4, 8], type: 'diag' },
  { id: 'diag-anti', name: 'Anti Diag ( top-right to bot-left )', indices: [2, 4, 6], type: 'diag' },
];

export const INITIAL_BOARD: BoardState = Array(9).fill(null);

export function checkWin(board: BoardState): { winner: Player | null; winningLine: Line | null } {
  for (const line of LINES) {
    const [a, b, c] = line.indices;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winningLine: line };
    }
  }
  return { winner: null, winningLine: null };
}

export function isBoardFull(board: BoardState): boolean {
  return board.every((cell) => cell !== null);
}

export function getPieceCount(board: BoardState): number {
  return board.filter((c) => c !== null).length;
}

/**
  Returns lines where all 3 cells are filled (non-null).
*/
export function getFilledLines(board: BoardState): Line[] {
  return LINES.filter((line) => {
    const [a, b, c] = line.indices;
    return board[a] !== null && board[b] !== null && board[c] !== null;
  });
}

/**
  D4 Symmetry Transformations on 3x3 grid (0..8)
*/
export const D4_TRANSFORMS: ((i: number) => number)[] = [
  // 0: Identity
  (i) => i,
  // 1: Rot90 CW
  (i) => {
    const r = Math.floor(i / 3), c = i % 3;
    return c * 3 + (2 - r);
  },
  // 2: Rot180
  (i) => {
    const r = Math.floor(i / 3), c = i % 3;
    return (2 - r) * 3 + (2 - c);
  },
  // 3: Rot270 CW
  (i) => {
    const r = Math.floor(i / 3), c = i % 3;
    return (2 - c) * 3 + r;
  },
  // 4: Flip Horizontal
  (i) => {
    const r = Math.floor(i / 3), c = i % 3;
    return (2 - r) * 3 + c;
  },
  // 5: Flip Vertical
  (i) => {
    const r = Math.floor(i / 3), c = i % 3;
    return r * 3 + (2 - c);
  },
  // 6: Transpose (Main Diag)
  (i) => {
    const r = Math.floor(i / 3), c = i % 3;
    return c * 3 + r;
  },
  // 7: Anti-Transpose (Anti Diag)
  (i) => {
    const r = Math.floor(i / 3), c = i % 3;
    return (2 - c) * 3 + (2 - r);
  },
];

export interface CanonicalDefinition {
  classNumber: number;
  className: string;
  abstractBoardStr: string;
  safeLineIds: string[];
}

export const CANONICAL_CLASSES: CanonicalDefinition[] = [
  {
    classNumber: 1,
    className: 'Class #1 (B B A / A A B / B A A)',
    abstractBoardStr: 'BBAAABBAA',
    safeLineIds: ['col-2', 'diag-main'],
  },
  {
    classNumber: 2,
    className: 'Class #2 (B A B / A B A / A B A)',
    abstractBoardStr: 'BABABAABA',
    safeLineIds: ['row-2', 'row-3', 'col-1', 'col-3'],
  },
  {
    classNumber: 3,
    className: 'Class #3 (B A A / A B B / A B A)',
    abstractBoardStr: 'BAAABBABA',
    safeLineIds: ['row-3', 'col-3', 'diag-anti'],
  },
];

export function boardToString(board: BoardState): string {
  return board.map((c) => (c === null ? '.' : c)).join('');
}

/**
  Converts a board to an abstract string using 'A' for the 5-piece player and 'B' for the 4-piece player.
  This abstracts away player symbol asymmetry (X vs O).
*/
export function boardToAbstractString(board: BoardState): string {
  const xCount = board.filter((c) => c === 'X').length;
  const oCount = board.filter((c) => c === 'O').length;
  const aSymbol: Player = xCount >= oCount ? 'X' : 'O';
  return board
    .map((c) => {
      if (c === null) return '.';
      return c === aSymbol ? 'A' : 'B';
    })
    .join('');
}

export function transformBoard(board: BoardState, transformFn: (i: number) => number): BoardState {
  const newBoard: BoardState = Array(9).fill(null);
  for (let i = 0; i < 9; i++) {
    newBoard[transformFn(i)] = board[i];
  }
  return newBoard;
}

/**
  Matches a full board against the canonical abstract classes using D4 symmetries and A/B symbol abstraction.
  Returns details on which canonical class it is, and maps safe removals back to current board lines.
*/
export function matchCanonicalClass(board: BoardState): CanonicalMatch | null {
  if (!isBoardFull(board)) return null;

  for (const canon of CANONICAL_CLASSES) {
    for (let t = 0; t < 8; t++) {
      const transformFn = D4_TRANSFORMS[t];
      const transformed = transformBoard(board, transformFn);
      const transformedAbstractStr = boardToAbstractString(transformed);

      if (transformedAbstractStr === canon.abstractBoardStr) {
        // Map canonical safe line IDs back to original board lines
        const safeOnOriginalBoard: string[] = [];

        for (const origLine of LINES) {
          // Find where origLine maps under transformFn
          const mappedIndices = origLine.indices.map(transformFn).sort((a, b) => a - b);
          // Find matching canonical line
          const canonLine = LINES.find(
            (l) => l.indices.slice().sort((a, b) => a - b).join(',') === mappedIndices.join(',')
          );

          if (canonLine && canon.safeLineIds.includes(canonLine.id)) {
            safeOnOriginalBoard.push(origLine.id);
          }
        }

        return {
          classNumber: canon.classNumber,
          className: canon.className,
          canonicalBoard: canon.abstractBoardStr,
          transformIndex: t,
          safeLineIds: safeOnOriginalBoard,
        };
      }
    }
  }

  return null;
}

/**
  Check if a specific line removal leads to a winning position or safe position.
*/
export function getSafeLineRemovals(board: BoardState): Line[] {
  const filledLines = getFilledLines(board);
  if (filledLines.length === 0) return [];

  if (isBoardFull(board)) {
    const match = matchCanonicalClass(board);
    if (match) {
      return filledLines.filter((l) => match.safeLineIds.includes(l.id));
    }
  }

  return filledLines;
}

/**
  Classical 3x3 Minimax for Tic-Tac-Toe placement.
  Evaluates pure classical placement until terminal state (win/loss/full board draw).
  Returns:
    +10: aiPlayer wins
    -10: opponent wins
      0: draw
*/
function classicalMinimax(
  board: BoardState,
  isMaximizing: boolean,
  aiPlayer: Player,
  opponent: Player
): number {
  const winState = checkWin(board);
  if (winState.winner === aiPlayer) return 10;
  if (winState.winner === opponent) return -10;

  const emptyIndices: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) emptyIndices.push(i);
  }

  // Draw on full board (or no moves left)
  if (emptyIndices.length === 0) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const idx of emptyIndices) {
      board[idx] = aiPlayer;
      const score = classicalMinimax(board, false, aiPlayer, opponent);
      board[idx] = null;
      if (score > bestScore) bestScore = score;
      if (bestScore === 10) break; // Cutoff
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const idx of emptyIndices) {
      board[idx] = opponent;
      const score = classicalMinimax(board, true, aiPlayer, opponent);
      board[idx] = null;
      if (score < bestScore) bestScore = score;
      if (bestScore === -10) break; // Cutoff
    }
    return bestScore;
  }
}

/**
  Positional rank helper for tie-breaking optimal moves:
  Center (4) -> Rank 3 (Highest)
  Corners (0, 2, 6, 8) -> Rank 2
  Edges (1, 3, 5, 7) -> Rank 1 (Lowest)
*/
function getPositionalRank(index: number): number {
  if (index === 4) return 3;
  if ([0, 2, 6, 8].includes(index)) return 2;
  return 1;
}

/**
  AI Strategy Engine for Tic Toc Toe.
  Combines Minimax with positional tie-breaking for optimal classical placement,
  and Canonical Safe Line Removals on full boards.
  Guarantees 100% mathematically optimal draw play in AI vs AI mode (infinite Catch-22 loop).
*/
export function getBestAIMove(
  board: BoardState,
  aiPlayer: Player
): { action: 'place' | 'clear'; index?: number; line?: Line } {
  const opponent: Player = aiPlayer === 'X' ? 'O' : 'X';

  // 1. FULL BOARD: Line Removal Phase
  if (isBoardFull(board)) {
    const filledLines = getFilledLines(board);
    const canonicalMatch = matchCanonicalClass(board);

    if (canonicalMatch && canonicalMatch.safeLineIds.length > 0) {
      // Get all safe lines on the current board
      const safeLines = filledLines.filter((l) => canonicalMatch.safeLineIds.includes(l.id));
      if (safeLines.length > 0) {
        // Pick randomly among safe lines to vary play and entertain
        const chosen = safeLines[Math.floor(Math.random() * safeLines.length)];
        return { action: 'clear', line: chosen };
      }
    }

    // Fallback if no canonical match (e.g. non-canonical custom human board):
    // Evaluate which line removal gives highest classical minimax score for aiPlayer
    let bestLine = filledLines[0];
    let bestScore = -Infinity;

    for (const line of filledLines) {
      const originalPieces = line.indices.map((idx) => board[idx]);
      line.indices.forEach((idx) => {
        board[idx] = null;
      });

      // After line removal, opponent plays next. Evaluate opponent's best score:
      const oppScore = classicalMinimax(board, true, opponent, aiPlayer);

      line.indices.forEach((idx, i) => {
        board[idx] = originalPieces[i];
      });

      const lineScore = -oppScore;
      if (lineScore > bestScore) {
        bestScore = lineScore;
        bestLine = line;
      }
    }

    return { action: 'clear', line: bestLine };
  }

  // 2. PLACEMENT PHASE (0 to 8 pieces)
  const emptyIndices: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) emptyIndices.push(i);
  }

  if (emptyIndices.length > 0) {
    const candidates: { index: number; score: number; posRank: number }[] = [];

    for (const idx of emptyIndices) {
      board[idx] = aiPlayer;
      // After aiPlayer places at idx, it is opponent's turn (isMaximizing = false)
      const score = classicalMinimax(board, false, aiPlayer, opponent);
      board[idx] = null;

      candidates.push({
        index: idx,
        score,
        posRank: getPositionalRank(idx),
      });
    }

    // Find maximum minimax score (10 for win, 0 for draw, -10 for loss)
    const maxScore = Math.max(...candidates.map((c) => c.score));

    // Filter to candidates with top minimax score
    const topScoreCandidates = candidates.filter((c) => c.score === maxScore);

    // Find highest positional rank among top-score candidates
    const maxPosRank = Math.max(...topScoreCandidates.map((c) => c.posRank));

    // Filter to candidates with both top score AND top positional rank
    const bestCandidates = topScoreCandidates.filter((c) => c.posRank === maxPosRank);

    // Pick randomly among best candidates (e.g. between 4 corners)
    const chosen = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];

    return { action: 'place', index: chosen.index };
  }

  // Fallback clear
  const filledLines = getFilledLines(board);
  if (filledLines.length > 0) {
    return { action: 'clear', line: filledLines[0] };
  }

  return { action: 'place', index: 0 };
}

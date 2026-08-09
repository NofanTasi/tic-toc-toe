import { BoardState, Line, Player, CanonicalMatch, GameVariant } from '../types';

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

export function checkWin(
  board: BoardState,
  variant: GameVariant = 'TTT',
  lastTurnPlayer: Player = 'X'
): { winner: Player | null; winningLine: Line | null } {
  if (variant === 'TTT') {
    for (const line of LINES) {
      const [a, b, c] = line.indices;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], winningLine: line };
      }
    }
  } else {
    // OXO mode: line must be O - X - O
    for (const line of LINES) {
      const [a, b, c] = line.indices;
      if (board[a] === 'O' && board[b] === 'X' && board[c] === 'O') {
        return { winner: lastTurnPlayer, winningLine: line };
      }
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
          // Find where origLine maps under transformFn:
          // newBoard[transformFn(i)] = board[i], so board[i] goes to position transformFn(i).
          // Therefore, indices origLine.indices on original board map to mappedIndices on transformed board.
          const mappedIndices = origLine.indices.map(transformFn).sort((a, b) => a - b);
          // Find canonical line on transformed board that matches mappedIndices
          const canonLine = LINES.find(
            (l) => l.indices.slice().sort((a, b) => a - b).join(',') === mappedIndices.join(',')
          );

          // Check if this canonical line on the transformed board is in safeLineIds for this canonical class
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
  Alpha-Beta Minimax for Tic-Tac-Toe / OXO with Dynamic Line Removals.
  Uses depth-weighted scores:
    +1000 - depth for aiPlayer win
    -1000 + depth for opponent win
    0 for draw
*/
function dynamicAlphaBetaMinimax(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  opponent: Player,
  variant: GameVariant = 'TTT',
  maxDepth: number = 8
): number {
  const winState = checkWin(board, variant, isMaximizing ? opponent : aiPlayer);
  if (winState.winner === aiPlayer) return 1000 - depth;
  if (winState.winner === opponent) return depth - 1000;

  if (depth >= maxDepth) return 0;

  const emptyIndices: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) emptyIndices.push(i);
  }

  const filledLines = getFilledLines(board);

  if (emptyIndices.length === 0 && filledLines.length === 0) return 0;

  const symbolChoices: Player[] =
    variant === 'TTT' ? [isMaximizing ? aiPlayer : opponent] : ['X', 'O'];

  if (isMaximizing) {
    let maxEval = -Infinity;

    for (const idx of emptyIndices) {
      for (const symbol of symbolChoices) {
        board[idx] = symbol;
        const evaluation = dynamicAlphaBetaMinimax(
          board,
          depth + 1,
          alpha,
          beta,
          false,
          aiPlayer,
          opponent,
          variant,
          maxDepth
        );
        board[idx] = null;

        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      if (beta <= alpha) break;
    }

    if (beta > alpha && filledLines.length > 0) {
      for (const line of filledLines) {
        const originalPieces = line.indices.map((i) => board[i]);
        line.indices.forEach((i) => (board[i] = null));

        const evaluation = dynamicAlphaBetaMinimax(
          board,
          depth + 1,
          alpha,
          beta,
          false,
          aiPlayer,
          opponent,
          variant,
          maxDepth
        );

        line.indices.forEach((i, idx) => (board[i] = originalPieces[idx]));

        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
    }

    return maxEval === -Infinity ? 0 : maxEval;
  } else {
    let minEval = Infinity;

    for (const idx of emptyIndices) {
      for (const symbol of symbolChoices) {
        board[idx] = symbol;
        const evaluation = dynamicAlphaBetaMinimax(
          board,
          depth + 1,
          alpha,
          beta,
          true,
          aiPlayer,
          opponent,
          variant,
          maxDepth
        );
        board[idx] = null;

        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      if (beta <= alpha) break;
    }

    if (beta > alpha && filledLines.length > 0) {
      for (const line of filledLines) {
        const originalPieces = line.indices.map((i) => board[i]);
        line.indices.forEach((i) => (board[i] = null));

        const evaluation = dynamicAlphaBetaMinimax(
          board,
          depth + 1,
          alpha,
          beta,
          true,
          aiPlayer,
          opponent,
          variant,
          maxDepth
        );

        line.indices.forEach((i, idx) => (board[i] = originalPieces[idx]));

        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
    }

    return minEval === Infinity ? 0 : minEval;
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
  AI Strategy Engine for Tic Toc Toe / OXO with Dynamic Line Removals.
  Combines Minimax with Canonical D4 Symmetries, Immediate Win filters, and Line Removal options.
*/
export function getBestAIMove(
  board: BoardState,
  aiPlayer: Player,
  variant: GameVariant = 'TTT'
): { action: 'place' | 'clear'; index?: number; symbolPlaced?: Player; line?: Line } {
  const opponent: Player = aiPlayer === 'X' ? 'O' : 'X';

  const emptyIndices: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) emptyIndices.push(i);
  }
  const filledLines = getFilledLines(board);

  // 1. FULL BOARD (9 pieces) in TTT: Use Canonical D4 Symmetries for infinite draw diversity
  if (variant === 'TTT' && isBoardFull(board)) {
    const canonicalMatch = matchCanonicalClass(board);

    if (canonicalMatch && canonicalMatch.safeLineIds.length > 0) {
      const safeLines = filledLines.filter((l) => canonicalMatch.safeLineIds.includes(l.id));
      if (safeLines.length > 0) {
        const chosen = safeLines[Math.floor(Math.random() * safeLines.length)];
        return { action: 'clear', line: chosen };
      }
    }
  }

  const symbolChoices: Player[] = variant === 'TTT' ? [aiPlayer] : ['X', 'O'];

  // 2. IMMEDIATE WIN CHECK (AI can win on this turn)
  for (const idx of emptyIndices) {
    for (const sym of symbolChoices) {
      board[idx] = sym;
      if (checkWin(board, variant, aiPlayer).winner === aiPlayer) {
        board[idx] = null;
        return { action: 'place', index: idx, symbolPlaced: sym };
      }
      board[idx] = null;
    }
  }
  for (const line of filledLines) {
    const originalPieces = line.indices.map((i) => board[i]);
    line.indices.forEach((i) => (board[i] = null));
    if (checkWin(board, variant, aiPlayer).winner === aiPlayer) {
      line.indices.forEach((i, idx) => (board[i] = originalPieces[idx]));
      return { action: 'clear', line };
    }
    line.indices.forEach((i, idx) => (board[i] = originalPieces[idx]));
  }

  // 3. IMMEDIATE BLOCK CHECK (Opponent can win on their next turn if empty index is filled)
  const oppSymbols: Player[] = variant === 'TTT' ? [opponent] : ['X', 'O'];
  for (const idx of emptyIndices) {
    for (const oppSym of oppSymbols) {
      board[idx] = oppSym;
      const oppWin = checkWin(board, variant, opponent);
      board[idx] = null;
      if (oppWin.winner === opponent) {
        // AI must block by occupying this cell!
        const blockSymbol = variant === 'TTT' ? aiPlayer : oppSym === 'O' ? 'X' : 'O';
        return { action: 'place', index: idx, symbolPlaced: blockSymbol };
      }
    }
  }

  type CandidateMove =
    | { action: 'place'; index: number; symbolPlaced: Player; score: number; posRank: number }
    | { action: 'clear'; line: Line; score: number; posRank: number };

  const candidates: CandidateMove[] = [];

  // A. Evaluate placement candidates
  for (const idx of emptyIndices) {
    for (const sym of symbolChoices) {
      board[idx] = sym;
      const score = dynamicAlphaBetaMinimax(
        board,
        1,
        -Infinity,
        Infinity,
        false,
        aiPlayer,
        opponent,
        variant,
        8
      );
      board[idx] = null;

      candidates.push({
        action: 'place',
        index: idx,
        symbolPlaced: sym,
        score,
        posRank: getPositionalRank(idx),
      });
    }
  }

  // B. Evaluate line removal candidates
  for (const line of filledLines) {
    const originalPieces = line.indices.map((i) => board[i]);
    line.indices.forEach((i) => (board[i] = null));

    const score = dynamicAlphaBetaMinimax(
      board,
      1,
      -Infinity,
      Infinity,
      false,
      aiPlayer,
      opponent,
      variant,
      8
    );

    line.indices.forEach((i, idx) => (board[i] = originalPieces[idx]));

    candidates.push({
      action: 'clear',
      line,
      score,
      posRank: 0,
    });
  }

  if (candidates.length === 0) {
    return { action: 'place', index: 0, symbolPlaced: 'X' };
  }

  // Find maximum minimax score
  const maxScore = Math.max(...candidates.map((c) => c.score));
  const topCandidates = candidates.filter((c) => c.score === maxScore);

  // Tie-breaker: prioritize candidates with highest positional rank / centrality (Center > Corners > Edges)
  const maxPosRank = Math.max(...topCandidates.map((c) => c.posRank));
  const bestPosCandidates = topCandidates.filter((c) => c.posRank === maxPosRank);

  const chosen = bestPosCandidates[Math.floor(Math.random() * bestPosCandidates.length)];

  if (chosen.action === 'place') {
    return { action: 'place', index: chosen.index, symbolPlaced: chosen.symbolPlaced };
  } else {
    return { action: 'clear', line: chosen.line };
  }
}

import { BoardState, BoardState as BoardType } from '../types';
import { boardToAbstractString, boardToString, matchCanonicalClass } from './tictactoe';

export interface CycleInfo {
  isCycle: boolean;
  cycleLength: number;
  firstSeenIndex: number;
  lastSeenIndex: number;
  cycleStates: string[];
}

export interface SccMetrics {
  totalTransitions: number;
  uniqueStatesCount: number;
  currentStateKey: string;
  abstractStateKey: string;
  canonicalClassName: string | null;
  visitCount: number;
  cycleInfo: CycleInfo;
  recentPath: { key: string; abstractKey: string; moveNum: number }[];
}

/**
 * Returns a unique canonical/string key for a board state.
 */
export function getBoardKey(board: BoardState): string {
  return boardToString(board);
}

/**
 * Detects if the current board state has appeared earlier in the move sequence.
 */
export function detectCycleInHistory(boardHistory: BoardState[]): CycleInfo {
  if (boardHistory.length <= 1) {
    return {
      isCycle: false,
      cycleLength: 0,
      firstSeenIndex: -1,
      lastSeenIndex: -1,
      cycleStates: [],
    };
  }

  const currentIdx = boardHistory.length - 1;
  const currentKey = getBoardKey(boardHistory[currentIdx]);

  // Search backwards for the previous occurrence of currentKey
  for (let i = currentIdx - 1; i >= 0; i--) {
    if (getBoardKey(boardHistory[i]) === currentKey) {
      const cycleLength = currentIdx - i;
      const cycleStates = boardHistory.slice(i, currentIdx + 1).map(getBoardKey);

      return {
        isCycle: true,
        cycleLength,
        firstSeenIndex: i,
        lastSeenIndex: currentIdx,
        cycleStates,
      };
    }
  }

  return {
    isCycle: false,
    cycleLength: 0,
    firstSeenIndex: -1,
    lastSeenIndex: -1,
    cycleStates: [],
  };
}

/**
 * Calculates complete SCC traversal metrics from a board history sequence.
 */
export function calculateSccMetrics(boardHistory: BoardState[]): SccMetrics {
  if (boardHistory.length === 0) {
    return {
      totalTransitions: 0,
      uniqueStatesCount: 0,
      currentStateKey: '.........',
      abstractStateKey: '.........',
      canonicalClassName: null,
      visitCount: 0,
      cycleInfo: {
        isCycle: false,
        cycleLength: 0,
        firstSeenIndex: -1,
        lastSeenIndex: -1,
        cycleStates: [],
      },
      recentPath: [],
    };
  }

  const currentBoard = boardHistory[boardHistory.length - 1];
  const currentStateKey = getBoardKey(currentBoard);
  const abstractStateKey = boardToAbstractString(currentBoard);
  const canonMatch = matchCanonicalClass(currentBoard);

  const keyCounts = new Map<string, number>();
  boardHistory.forEach((b) => {
    const k = getBoardKey(b);
    keyCounts.set(k, (keyCounts.get(k) || 0) + 1);
  });

  const uniqueStatesCount = keyCounts.size;
  const visitCount = keyCounts.get(currentStateKey) || 1;
  const cycleInfo = detectCycleInHistory(boardHistory);

  const recentPath = boardHistory.slice(-8).map((b, idx) => {
    const globalIdx = Math.max(0, boardHistory.length - 8) + idx;
    return {
      key: getBoardKey(b),
      abstractKey: boardToAbstractString(b),
      moveNum: globalIdx,
    };
  });

  return {
    totalTransitions: boardHistory.length - 1,
    uniqueStatesCount,
    currentStateKey,
    abstractStateKey,
    canonicalClassName: canonMatch ? canonMatch.className : null,
    visitCount,
    cycleInfo,
    recentPath,
  };
}

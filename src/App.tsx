import { useState, useEffect, useCallback } from 'react';
import {
  BoardState,
  GameMode,
  Line,
  MoveHistoryItem,
  Player,
} from './types';
import {
  checkWin,
  getBestAIMove,
  getFilledLines,
  getSafeLineRemovals,
  INITIAL_BOARD,
  isBoardFull,
  matchCanonicalClass,
} from './utils/tictactoe';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { StrategyInspector } from './components/StrategyInspector';
import { RulesModal } from './components/RulesModal';

export default function App() {
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [currentTurn, setCurrentTurn] = useState<Player>('X');
  const [mode, setMode] = useState<GameMode>('pva_x');
  const [history, setHistory] = useState<MoveHistoryItem[]>([]);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [aiSpeed, setAiSpeed] = useState<number>(400);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [isAiPaused, setIsAiPaused] = useState<boolean>(false);

  const winInfo = checkWin(board);
  const winner = winInfo.winner;
  const winningLine = winInfo.winningLine;

  const filledLines = getFilledLines(board);
  const canonicalMatch = matchCanonicalClass(board);
  const safeLines = getSafeLineRemovals(board);
  const safeLineIds = safeLines.map((l) => l.id);
  const boardIsFull = isBoardFull(board);

  // Reset Game
  const handleReset = useCallback(() => {
    setBoard(INITIAL_BOARD);
    setCurrentTurn('X');
    setHistory([]);
    setIsAiThinking(false);
  }, []);

  // Mode Selection
  const handleSelectMode = (newMode: GameMode) => {
    setMode(newMode);
    handleReset();
  };

  // Place Mark Action
  const handleCellClick = useCallback(
    (index: number) => {
      if (board[index] !== null || winner !== null || isAiThinking) return;

      const boardBefore = [...board];
      const newBoard = [...board];
      newBoard[index] = currentTurn;

      const newHistoryItem: MoveHistoryItem = {
        id: `move-${Date.now()}-${Math.random()}`,
        turn: currentTurn,
        action: 'place',
        cellIndex: index,
        boardBefore,
        boardAfter: newBoard,
        timestamp: Date.now(),
      };

      setBoard(newBoard);
      setHistory((prev) => [...prev, newHistoryItem]);

      const check = checkWin(newBoard);
      if (!check.winner) {
        setCurrentTurn((prev) => (prev === 'X' ? 'O' : 'X'));
      }
    },
    [board, currentTurn, winner, isAiThinking]
  );

  // Clear Line Action
  const handleClearLine = useCallback(
    (line: Line) => {
      if (winner !== null || isAiThinking) return;

      const boardBefore = [...board];
      const newBoard = [...board];
      line.indices.forEach((idx) => {
        newBoard[idx] = null;
      });

      const newHistoryItem: MoveHistoryItem = {
        id: `move-${Date.now()}-${Math.random()}`,
        turn: currentTurn,
        action: 'clear',
        lineCleared: line,
        boardBefore,
        boardAfter: newBoard,
        timestamp: Date.now(),
      };

      setBoard(newBoard);
      setHistory((prev) => [...prev, newHistoryItem]);
      setCurrentTurn((prev) => (prev === 'X' ? 'O' : 'X'));
    },
    [board, currentTurn, winner, isAiThinking]
  );

  // Undo Last Move
  const handleUndo = useCallback(() => {
    if (history.length === 0 || isAiThinking) return;

    const lastMove = history[history.length - 1];
    setBoard(lastMove.boardBefore);
    setCurrentTurn(lastMove.turn);
    setHistory((prev) => prev.slice(0, -1));
  }, [history, isAiThinking]);

  // AI Step Move Logic
  const executeAiTurn = useCallback(() => {
    if (winner !== null) return;

    setIsAiThinking(true);
    const move = getBestAIMove(board, currentTurn);

    if (move.action === 'place' && move.index !== undefined) {
      const boardBefore = [...board];
      const newBoard = [...board];
      newBoard[move.index] = currentTurn;

      const newHistoryItem: MoveHistoryItem = {
        id: `move-${Date.now()}-${Math.random()}`,
        turn: currentTurn,
        action: 'place',
        cellIndex: move.index,
        boardBefore,
        boardAfter: newBoard,
        timestamp: Date.now(),
      };

      setBoard(newBoard);
      setHistory((prev) => [...prev, newHistoryItem]);

      const check = checkWin(newBoard);
      if (!check.winner) {
        setCurrentTurn((prev) => (prev === 'X' ? 'O' : 'X'));
      }
    } else if (move.action === 'clear' && move.line) {
      const boardBefore = [...board];
      const newBoard = [...board];
      move.line.indices.forEach((idx) => {
        newBoard[idx] = null;
      });

      const newHistoryItem: MoveHistoryItem = {
        id: `move-${Date.now()}-${Math.random()}`,
        turn: currentTurn,
        action: 'clear',
        lineCleared: move.line,
        boardBefore,
        boardAfter: newBoard,
        timestamp: Date.now(),
      };

      setBoard(newBoard);
      setHistory((prev) => [...prev, newHistoryItem]);
      setCurrentTurn((prev) => (prev === 'X' ? 'O' : 'X'));
    }

    setIsAiThinking(false);
  }, [board, currentTurn, winner]);

  // AI Auto-Triggering Effect
  useEffect(() => {
    if (winner !== null || isAiPaused) return;

    let isAiTurn = false;
    if (mode === 'pva_x' && currentTurn === 'O') isAiTurn = true;
    if (mode === 'pva_o' && currentTurn === 'X') isAiTurn = true;
    if (mode === 'ava') isAiTurn = true;

    if (isAiTurn && !isAiThinking) {
      const timer = setTimeout(() => {
        executeAiTurn();
      }, aiSpeed);
      return () => clearTimeout(timer);
    }
  }, [board, currentTurn, mode, winner, aiSpeed, isAiThinking, isAiPaused, executeAiTurn]);

  // Disable controls if AI is taking turn or game over
  const isHumanTurn =
    winner === null &&
    !isAiThinking &&
    (mode === 'pvp' ||
      (mode === 'pva_x' && currentTurn === 'X') ||
      (mode === 'pva_o' && currentTurn === 'O'));

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-mono py-6 px-4">
      <div className="max-w-xl mx-auto flex flex-col items-center">
        {/* Header */}
        <Header
          mode={mode}
          onSelectMode={handleSelectMode}
          onOpenRules={() => setIsRulesOpen(true)}
          onReset={handleReset}
        />

        {/* Main Board */}
        <main className="w-full flex flex-col items-center my-2">
          <Board
            board={board}
            currentTurn={currentTurn}
            winningLine={winningLine}
            winner={winner}
            filledLines={filledLines}
            safeLineIds={safeLineIds}
            isBoardFull={boardIsFull}
            onCellClick={handleCellClick}
            onClearLine={handleClearLine}
            disabled={!isHumanTurn}
          />
        </main>

        {/* Strategy Inspector */}
        <StrategyInspector
          board={board}
          canonicalMatch={canonicalMatch}
          history={history}
          onUndo={handleUndo}
          canUndo={history.length > 0 && !isAiThinking}
          onOpenReferenceModal={() => setIsRulesOpen(true)}
          isAiVsAi={mode === 'ava'}
          aiSpeed={aiSpeed}
          onSetAiSpeed={setAiSpeed}
          onStepAi={executeAiTurn}
          isAiPlaying={isAiThinking}
          isAiPaused={isAiPaused}
          onToggleAiPause={() => setIsAiPaused((prev) => !prev)}
        />

        {/* Rules & Symmetry Strategy Modal */}
        <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      </div>
    </div>
  );
}

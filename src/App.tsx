import { useState, useEffect, useCallback } from 'react';
import {
  BoardState,
  GameMode,
  GameVariant,
  Language,
  Line,
  MoveHistoryItem,
  Player,
} from './types';
import {
  checkWin,
  getBestAIMove,
  getFilledLines,
  INITIAL_BOARD,
  isBoardFull,
} from './utils/tictactoe';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { RulesModal } from './components/RulesModal';
import { DebugPanel } from './components/DebugPanel';

export default function App() {
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [currentTurn, setCurrentTurn] = useState<Player>('X');
  const [mode, setMode] = useState<GameMode>('pva_x');
  const [variant, setVariant] = useState<GameVariant>('TTT');
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('tictactoe_language');
    return (saved as Language) || 'EN';
  });
  const [activePlacementSymbol, setActivePlacementSymbol] = useState<Player>('X');
  const [history, setHistory] = useState<MoveHistoryItem[]>([]);
  const [redoStack, setRedoStack] = useState<MoveHistoryItem[]>([]);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isDebug, setIsDebug] = useState<boolean>(false);
  const [aiSpeed, setAiSpeed] = useState<number>(400);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [isAiPaused, setIsAiPaused] = useState<boolean>(false);
  const [gameTracked, setGameTracked] = useState<boolean>(false);
  const [gamesPlayed, setGamesPlayed] = useState<number>(() => {
    const saved = localStorage.getItem('tictactoe_games_played');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });

  const handleSelectLanguage = (newLang: Language) => {
    setLanguage(newLang);
    localStorage.setItem('tictactoe_language', newLang);
  };

  const recordGameStart = useCallback(() => {
    setGameTracked((alreadyTracked) => {
      if (!alreadyTracked) {
        setGamesPlayed((prev) => {
          const next = prev + 1;
          localStorage.setItem('tictactoe_games_played', String(next));
          return next;
        });
        return true;
      }
      return alreadyTracked;
    });
  }, []);

  const winInfo = checkWin(board, variant, currentTurn === 'X' ? 'O' : 'X');
  const winner = winInfo.winner;
  const winningLine = winInfo.winningLine;

  const filledLines = getFilledLines(board);
  const boardIsFull = isBoardFull(board);

  // Reset Game
  const handleReset = useCallback(() => {
    setBoard(INITIAL_BOARD);
    setCurrentTurn('X');
    setHistory([]);
    setRedoStack([]);
    setIsAiThinking(false);
    setGameTracked(false);
  }, []);

  // Mode Selection
  const handleSelectMode = (newMode: GameMode) => {
    setMode(newMode);
    handleReset();
  };

  // Variant Selection
  const handleSelectVariant = (newVariant: GameVariant) => {
    setVariant(newVariant);
    handleReset();
  };

  // Speed Adjustment (Presets)
  const SPEED_STEPS = [1500, 1000, 600, 400, 200, 100, 30];

  const handleSpeedFaster = useCallback(() => {
    setAiSpeed((current) => {
      const idx = SPEED_STEPS.indexOf(current);
      if (idx === -1) {
        const found = SPEED_STEPS.findIndex((s) => s <= current);
        return found > 0 ? SPEED_STEPS[found - 1] : SPEED_STEPS[SPEED_STEPS.length - 1];
      }
      return idx < SPEED_STEPS.length - 1 ? SPEED_STEPS[idx + 1] : current;
    });
  }, []);

  const handleSpeedSlower = useCallback(() => {
    setAiSpeed((current) => {
      const idx = SPEED_STEPS.indexOf(current);
      if (idx === -1) {
        const found = SPEED_STEPS.findIndex((s) => s <= current);
        return found !== -1 ? SPEED_STEPS[Math.max(0, found - 1)] : SPEED_STEPS[0];
      }
      return idx > 0 ? SPEED_STEPS[idx - 1] : current;
    });
  }, []);

  // Invert Active Mark
  const handleInvertPlacementSymbol = () => {
    setActivePlacementSymbol((prev) => (prev === 'X' ? 'O' : 'X'));
  };

  // Place Mark Action
  const handleCellClick = useCallback(
    (index: number) => {
      if (board[index] !== null || winner !== null || isAiThinking) return;
      recordGameStart();

      const symbolToPlace = variant === 'OXO' ? activePlacementSymbol : currentTurn;
      const boardBefore = [...board];
      const newBoard = [...board];
      newBoard[index] = symbolToPlace;

      const newHistoryItem: MoveHistoryItem = {
        id: `move-${Date.now()}-${Math.random()}`,
        turn: currentTurn,
        action: 'place',
        cellIndex: index,
        symbolPlaced: symbolToPlace,
        boardBefore,
        boardAfter: newBoard,
        timestamp: Date.now(),
      };

      setBoard(newBoard);
      setHistory((prev) => [...prev, newHistoryItem]);
      setRedoStack([]); // Clear redo stack on new branch
      setIsAiPaused(false);

      const check = checkWin(newBoard, variant, currentTurn);
      if (!check.winner) {
        setCurrentTurn((prev) => (prev === 'X' ? 'O' : 'X'));
      }
    },
    [board, currentTurn, variant, activePlacementSymbol, winner, isAiThinking, recordGameStart]
  );

  // Clear Line Action
  const handleClearLine = useCallback(
    (line: Line) => {
      if (winner !== null || isAiThinking) return;
      recordGameStart();

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
      setRedoStack([]); // Clear redo stack on new branch
      setIsAiPaused(false);
      setCurrentTurn((prev) => (prev === 'X' ? 'O' : 'X'));
    },
    [board, currentTurn, winner, isAiThinking, recordGameStart]
  );

  // Undo Single Move (last move, then second last, etc.)
  const handleUndo = useCallback(() => {
    if (history.length === 0 || isAiThinking) return;

    setIsAiPaused(true);
    const lastMove = history[history.length - 1];
    setBoard(lastMove.boardBefore);
    setCurrentTurn(lastMove.turn);
    setHistory((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [lastMove, ...prev]);
  }, [history, isAiThinking]);

  // Redo Single Move
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || isAiThinking) return;

    setIsAiPaused(true);
    const nextMove = redoStack[0];
    setBoard(nextMove.boardAfter);
    const win = checkWin(nextMove.boardAfter, variant, nextMove.turn);
    if (!win.winner) {
      setCurrentTurn(nextMove.turn === 'X' ? 'O' : 'X');
    }
    setHistory((prev) => [...prev, nextMove]);
    setRedoStack((prev) => prev.slice(1));
  }, [redoStack, isAiThinking, variant]);

  // AI Step Move Logic
  const executeAiTurn = useCallback(() => {
    if (winner !== null) return;
    recordGameStart();

    setIsAiThinking(true);
    const move = getBestAIMove(board, currentTurn, variant);

    if (move.action === 'place' && move.index !== undefined) {
      const symbolToPlace = move.symbolPlaced || (variant === 'OXO' ? 'X' : currentTurn);
      const boardBefore = [...board];
      const newBoard = [...board];
      newBoard[move.index] = symbolToPlace;

      const newHistoryItem: MoveHistoryItem = {
        id: `move-${Date.now()}-${Math.random()}`,
        turn: currentTurn,
        action: 'place',
        cellIndex: move.index,
        symbolPlaced: symbolToPlace,
        boardBefore,
        boardAfter: newBoard,
        timestamp: Date.now(),
      };

      setBoard(newBoard);
      setHistory((prev) => [...prev, newHistoryItem]);
      setRedoStack([]); // New step clears redo stack

      const check = checkWin(newBoard, variant, currentTurn);
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
      setRedoStack([]); // New step clears redo stack
      setCurrentTurn((prev) => (prev === 'X' ? 'O' : 'X'));
    }

    setIsAiThinking(false);
  }, [board, currentTurn, variant, winner, recordGameStart]);

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
          variant={variant}
          language={language}
          isDebug={isDebug}
          onSelectMode={handleSelectMode}
          onSelectVariant={handleSelectVariant}
          onOpenRules={() => setIsRulesOpen(true)}
          onToggleDebug={() => setIsDebug((prev) => !prev)}
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
            isBoardFull={boardIsFull}
            variant={variant}
            mode={mode}
            language={language}
            onSelectLanguage={handleSelectLanguage}
            activePlacementSymbol={activePlacementSymbol}
            onSelectPlacementSymbol={setActivePlacementSymbol}
            onInvertPlacementSymbol={handleInvertPlacementSymbol}
            onCellClick={handleCellClick}
            onClearLine={handleClearLine}
            disabled={!isHumanTurn}
            isAiPaused={isAiPaused}
            onToggleAiPause={() => setIsAiPaused((prev) => !prev)}
            onStepAi={executeAiTurn}
            aiSpeed={aiSpeed}
            onSpeedFaster={handleSpeedFaster}
            onSpeedSlower={handleSpeedSlower}
            onUndo={handleUndo}
            canUndo={history.length > 0 && !isAiThinking}
            onRedo={handleRedo}
            canRedo={redoStack.length > 0 && !isAiThinking}
            isAiThinking={isAiThinking}
          />
        </main>

        {/* Debug Panel */}
        {isDebug && (
          <DebugPanel
            board={board}
            currentTurn={currentTurn}
            mode={mode}
            variant={variant}
            language={language}
            history={history}
            winner={winner}
            filledLines={filledLines}
            isBoardFull={boardIsFull}
            gamesPlayed={gamesPlayed}
            aiSpeed={aiSpeed}
            onSetAiSpeed={setAiSpeed}
            isAiPaused={isAiPaused}
            onToggleAiPause={() => setIsAiPaused((prev) => !prev)}
            onStepAi={executeAiTurn}
            onUndo={handleUndo}
            canUndo={history.length > 0 && !isAiThinking}
            onRedo={handleRedo}
            canRedo={redoStack.length > 0 && !isAiThinking}
            isAiThinking={isAiThinking}
          />
        )}

        {/* Rules Modal */}
        <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} language={language} />
      </div>
    </div>
  );
}

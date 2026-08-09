import { useState, useEffect, useCallback } from 'react';
import {
  BoardState,
  GameMode,
  GameVariant,
  Line,
  MoveHistoryItem,
  Player,
  UiMode,
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
  const [uiMode, setUiMode] = useState<UiMode>('NORMAL');
  const [activePlacementSymbol, setActivePlacementSymbol] = useState<Player>('X');
  const [history, setHistory] = useState<MoveHistoryItem[]>([]);
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

  // UI Mode Toggle (NORMAL vs WIP)
  const handleToggleUiMode = () => {
    setUiMode((prev) => {
      const next = prev === 'NORMAL' ? 'WIP' : 'NORMAL';
      if (next === 'NORMAL') {
        setVariant('TTT');
      }
      return next;
    });
    handleReset();
  };

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
      setCurrentTurn((prev) => (prev === 'X' ? 'O' : 'X'));
    },
    [board, currentTurn, winner, isAiThinking, recordGameStart]
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
          uiMode={uiMode}
          isDebug={isDebug}
          onSelectMode={handleSelectMode}
          onSelectVariant={handleSelectVariant}
          onToggleUiMode={handleToggleUiMode}
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
            uiMode={uiMode}
            activePlacementSymbol={activePlacementSymbol}
            onSelectPlacementSymbol={setActivePlacementSymbol}
            onInvertPlacementSymbol={handleInvertPlacementSymbol}
            onCellClick={handleCellClick}
            onClearLine={handleClearLine}
            disabled={!isHumanTurn}
          />
        </main>

        {/* Debug Panel */}
        {isDebug && (
          <DebugPanel
            board={board}
            currentTurn={currentTurn}
            mode={mode}
            variant={variant}
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
            isAiThinking={isAiThinking}
          />
        )}

        {/* Rules Modal */}
        <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
      </div>
    </div>
  );
}

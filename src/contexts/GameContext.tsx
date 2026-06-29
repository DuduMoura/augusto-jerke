"use client";

import { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface GameState {
  gameId: string;
  characterId1: string;
  characterId2: string;
  spellId3: string;
  attemptsChallenge1: number;
  attemptsChallenge2: number;
  attemptsChallenge3: number;
  currentChallenge: 1 | 2 | 3;
  isFinished: boolean;
  guessedCharacters1: string[];
  guessedCharacters2: string[];
  challenge2Penalty: number;
  pendingChallengeId: string;
}

const defaultState: GameState = {
  gameId: "",
  characterId1: "",
  characterId2: "",
  spellId3: "",
  attemptsChallenge1: 0,
  attemptsChallenge2: 0,
  attemptsChallenge3: 0,
  currentChallenge: 1,
  isFinished: false,
  guessedCharacters1: [],
  guessedCharacters2: [],
  challenge2Penalty: 0,
  pendingChallengeId: "",
};

interface GameContextValue {
  state: GameState;
  setState: (value: GameState | ((val: GameState) => GameState)) => void;
  resetGame: () => void;
  startGame: (data: {
    gameId: string;
    characterId1: string;
    characterId2: string;
    spellId3: string;
  }) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState, removeState] = useLocalStorage<GameState>("potterdle-game", defaultState);

  function resetGame() {
    removeState();
  }

  function startGame(data: { gameId: string; characterId1: string; characterId2: string; spellId3: string }) {
    setState({
      ...defaultState,
      ...data,
    });
  }

  return (
    <GameContext.Provider value={{ state, setState, resetGame, startGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}

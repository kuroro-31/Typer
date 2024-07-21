import { create } from "zustand";

import {
  endGame,
  failureAudio,
  handleTyping,
  resetGame,
  selectNewWord,
  startGame,
  stopAudio,
} from "@/actions/gameActions";
import { GameState } from "@/types/gameState";
import { loadLevels } from "@/utils/loadLevels";

export const useGameStore = create<GameState>((set, get) => {
  let audio: HTMLAudioElement | null = null;

  return {
    screen: "home",
    gameAudio: null,
    gameStarted: false,
    gameInProgress: null,
    timer: 120,
    score: 0,
    currentWord: null,
    typedWord: "",
    missCount: 0,
    level: 1,
    levels: [],
    wordsForCurrentLevel: [],
    usedWords: [],
    setScreen: (screen) => set({ screen }),
    startGame: () => startGame(set, get),
    endGame: () => endGame(set, get),
    resetGame: () => resetGame(set, get),
    handleTyping: handleTyping(set, get),
    selectNewWord: () => selectNewWord(set, get),
    failureAudio: () => failureAudio(), // 修正
    stopAudio: () => stopAudio(get),
  };
});

// 初期化処理をクライアントサイドでのみ実行
if (typeof window !== "undefined") {
  useGameStore.setState((state) => {
    const audio = new Audio("/game.mp3");
    audio.volume = 0.5;
    return {
      ...state,
      gameAudio: audio,
    };
  });

  loadLevels().then((levels) => {
    useGameStore.setState((state) => ({
      ...state,
      levels: levels,
      wordsForCurrentLevel: levels[0], // 初期化時に最初のレベルのワードをセット
    }));
  });
}

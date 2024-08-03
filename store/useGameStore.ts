import { create } from "zustand";

import { failureAudio, stopAudio } from "@/actions/audioActions";
import {
  endGame,
  handleTyping,
  nextWord,
  resetGame,
  selectNewWord,
  startGame,
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
    progress: 0, // プログレスバーの初期値を追加
    setScreen: (screen) => set({ screen }),
    startGame: () => startGame(set, get),
    endGame: () => endGame(set, get),
    resetGame: () => resetGame(set, get),
    handleTyping: handleTyping(set, get),
    selectNewWord: () => selectNewWord(set, get),
    nextWord: () => nextWord(set, get), // nextWord関数を追加
    resetProgressBar: () => set({ progress: 0 }), // プログレスバーのリセット関数を追加
    failureAudio: () => failureAudio(),
    stopAudio: () => {
      const { gameAudio } = get();
      if (gameAudio) {
        stopAudio(gameAudio);
      }
    }, // 修正: gameAudioを引数として渡す
    playAudio: () => {
      const { gameAudio } = get();
      if (gameAudio) {
        gameAudio.play();
      }
    }, // playAudio関数を追加
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

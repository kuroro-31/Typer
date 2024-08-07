import { create } from "zustand";

import { failureAudio, stopAudio } from "@/actions/audioActions";
import {
  addExperience,
  endGame,
  handleTyping,
  nextWord,
  resetGame,
  selectNewWord,
  startGame,
} from "@/actions/gameActions";
import { GameState } from "@/types/gameState";
import { loadLevels } from "@/utils/loadLevels";

const useGameStore = create<GameState>((set, get) => ({
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
  progressBar: 0, // プログレスバーの初期値を追加
  setScreen: (screen) => set({ screen }),
  startGame: () => startGame(set, get),
  endGame: () => endGame(set, get),
  resetGame: () => resetGame(set, get),
  handleTyping: handleTyping(set, get), // handleTyping関数を実行して返された関数をセット
  selectNewWord: () => selectNewWord(set, get),
  nextWord: () => {
    setTimeout(() => nextWord(set, get), 0); // setTimeoutを使用してレンダリング中のsetState呼び出しを回避
  },
  resetProgressBar: () => {
    console.log("プログレスバーをリセット前2"); // デバッグログ追加
    set({ progressBar: 0 });
    console.log("プログレスバーをリセット後2"); // デバッグログ追加
  }, // プログレスバーのリセット関数を追加
  setProgress: (progress: number) => set({ progress }), // プログレスバーの進行を管理する関数を追加
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
  currentLevel: 1, // 初期レベル
  experience: 0, // 初期総経験値
  levelExperience: { 1: 0, 2: 0, 3: 0, 4: 0 }, // 各レベルの初期経験値
  addExperience: (level: number) => addExperience(set, get, level), // addExperience関数を修正
}));
export default useGameStore;

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

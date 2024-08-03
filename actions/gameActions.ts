/*
|--------------------------------------------------------------------------
| ゲームのアクション
|--------------------------------------------------------------------------
*/
import { StoreApi } from "zustand";

import { GameState } from "@/types/gameState";
import { Word } from "@/types/word";

import {
  failureAudio,
  startAudio,
  stopAudio,
  successAudio,
  typingAudio,
} from "./audioActions";

export const startGame = async (
  set: StoreApi<GameState>["setState"],
  get: StoreApi<GameState>["getState"]
) => {
  // ゲーム開始時に音声を再生
  startAudio();

  const { gameAudio, selectNewWord } = get();
  set({
    gameStarted: true,
    gameInProgress: true,
    score: 0,
    missCount: 0,
    typedWord: "",
    screen: "level",
    timer: 120,
  });
  await selectNewWord();
  if (gameAudio) {
    gameAudio
      .play()
      .catch((error) => console.error("Audio playback failed:", error));
  }
};

export const endGame = (
  set: StoreApi<GameState>["setState"],
  get: StoreApi<GameState>["getState"]
) => {
  const { gameAudio } = get();
  set({
    gameStarted: false,
    gameInProgress: false,
    screen: "result",
  });
  stopAudio(gameAudio); // 音声停止
};

export const resetGame = (
  set: StoreApi<GameState>["setState"],
  get: StoreApi<GameState>["getState"]
) => {
  const { gameAudio } = get();
  stopAudio(gameAudio); // 音声停止
  set({
    gameInProgress: false,
    currentWord: null,
    typedWord: "",
    score: 0,
    timer: 0,
    missCount: 0,
  });
};

export const handleTyping =
  (
    set: StoreApi<GameState>["setState"],
    get: StoreApi<GameState>["getState"]
  ) =>
  (input: string) => {
    const { currentWord, typedWord, selectNewWord, resetProgressBar } = get();
    if (!currentWord) return;

    const matchedRomaji = currentWord.romaji.find((romaji) =>
      romaji.startsWith(typedWord + input)
    );

    console.log(`Input: ${input}, Matched Romaji: ${matchedRomaji}`); // デバッグ用ログ

    if (matchedRomaji) {
      set((state) => ({ typedWord: state.typedWord + input }));
      typingAudio(); // タイピング音声を再生
      if (typedWord + input === matchedRomaji) {
        successAudio(); // 成功時に音声を再生
        set((state) => ({ score: state.score + 1 }));
        selectNewWord();
        resetProgressBar(); // プログレスバーをリセット
        set({ typedWord: "" });
      }
    } else {
      set((state) => ({ missCount: state.missCount + 1 }));
      console.log("Playing audio for incorrect input"); // デバッグ用ログ
      failureAudio(); // 失敗時に音声を再生
    }
  };

export const selectNewWord = async (
  set: StoreApi<GameState>["setState"],
  get: StoreApi<GameState>["getState"]
) => {
  const { levels, level, wordsForCurrentLevel, usedWords } = get();
  if (wordsForCurrentLevel.length === 0) {
    const currentLevelWords: Word[] = [...levels[level - 1]];
    set({ wordsForCurrentLevel: currentLevelWords, usedWords: [] });
  }

  const availableWords = wordsForCurrentLevel.filter(
    (word) => !usedWords.includes(word)
  );

  if (availableWords.length === 0) {
    const currentLevelWords: Word[] = [...levels[level - 1]];
    set({ wordsForCurrentLevel: currentLevelWords, usedWords: [] });
    return;
  }

  const newWord =
    availableWords[Math.floor(Math.random() * availableWords.length)];

  if (newWord) {
    set((state) => ({
      currentWord: newWord,
      usedWords: [...state.usedWords, newWord],
    }));
  }
};

export const nextWord = (
  set: StoreApi<GameState>["setState"],
  get: StoreApi<GameState>["getState"]
) => {
  const { wordsForCurrentLevel, usedWords } = get();
  const remainingWords = wordsForCurrentLevel.filter(
    (word: Word) => !usedWords.some((usedWord) => usedWord.kanji === word.kanji)
  );

  if (remainingWords.length === 0) {
    set({ gameInProgress: false });
    return;
  }

  const nextWord =
    remainingWords[Math.floor(Math.random() * remainingWords.length)];
  set((state) => ({
    currentWord: nextWord,
    typedWord: "",
    usedWords: [...state.usedWords, nextWord],
  }));
};

/*
|--------------------------------------------------------------------------
| ゲームのアクション
|--------------------------------------------------------------------------
*/
import { StoreApi } from 'zustand';

import { GameState } from '@/types/gameState';
import { Word } from '@/types/word';

import { failureAudio, startAudio, stopAudio, successAudio, typingAudio } from './audioActions';

export const addExperience = (
  set: StoreApi<GameState>["setState"],
  get: StoreApi<GameState>["getState"],
  level: number
) => {
  const { experience, levelExperience } = get();
  const newExperience = experience + 1; // 経験値を1増やす
  const newLevelExperience = {
    ...levelExperience,
    [level]: (levelExperience[level] || 0) + 1,
  };

  // デバッグ情報をコンソールに出力
  console.log(`Adding experience to level: ${level}`);
  console.log(`Current experience: ${experience}`);
  console.log(`New experience: ${newExperience}`);
  console.log(`Current level experience:`, levelExperience);
  console.log(`New level experience:`, newLevelExperience);

  set({ experience: newExperience, levelExperience: newLevelExperience });
};

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
    experience: 0, // 経験値をリセット
    levelExperience: { 1: 0, 2: 0, 3: 0, 4: 0 }, // 各レベルの経験値をリセット
  });
};

export const handleTyping = (
  set: StoreApi<GameState>["setState"],
  get: StoreApi<GameState>["getState"]
) => {
  return (input: string) => {
    const {
      currentWord,
      typedWord,
      selectNewWord,
      resetProgressBar,
      currentLevel,
    } = get();
    if (!currentWord) return;

    const matchedRomaji = currentWord.romaji.find((romaji) =>
      romaji.startsWith(typedWord + input)
    );

    if (matchedRomaji) {
      set((state) => ({ typedWord: state.typedWord + input }));
      typingAudio(); // タイピング音声を再生
      if (typedWord + input === matchedRomaji) {
        successAudio(); // 成功時に音声を再生

        // スコアと経験値を更新
        set((state) => {
          const wordLevel = currentWord.level ?? 1; // currentWord.levelがundefinedの場合は1を使用
          const newLevelExperience = {
            ...state.levelExperience,
            [wordLevel]: (state.levelExperience[wordLevel] || 0) + 1,
          };

          console.log(
            `Word completed: ${currentWord.kanji}, Level experience:`,
            newLevelExperience
          );

          return {
            score: state.score + (currentWord.score || 0),
            levelExperience: newLevelExperience,
          };
        });

        selectNewWord();
        set({ typedWord: "" });
        resetProgressBar(); // プログレスバーをリセット
      }
    } else {
      set((state) => ({ missCount: state.missCount + 1 }));
      console.log("Playing audio for incorrect input"); // デバッグ用ログ
      failureAudio(); // 失敗時に音声を再生
    }
  };
};

export const selectNewWord = async (
  set: StoreApi<GameState>["setState"],
  get: StoreApi<GameState>["getState"]
) => {
  const {
    levels,
    currentLevel,
    wordsForCurrentLevel,
    usedWords,
    gameInProgress,
  } = get();

  if (!gameInProgress) return;

  if (wordsForCurrentLevel.length === 0) {
    const currentLevelWords: Word[] = [...levels[currentLevel - 1]];
    set({ wordsForCurrentLevel: currentLevelWords, usedWords: [] });
  }

  const availableWords = wordsForCurrentLevel.filter(
    (word) => !usedWords.includes(word)
  );

  if (availableWords.length === 0) {
    const currentLevelWords: Word[] = [...levels[currentLevel - 1]];
    set({ wordsForCurrentLevel: currentLevelWords, usedWords: [] });
    return;
  }

  const newWord =
    availableWords[Math.floor(Math.random() * availableWords.length)];

  if (newWord) {
    set({
      currentWord: newWord, // 新しいワードを設定
    });
  }
};

export const nextWord = (
  set: StoreApi<GameState>["setState"],
  get: StoreApi<GameState>["getState"]
) => {
  const { wordsForCurrentLevel, usedWords, currentLevel } = get();
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
    currentWord: nextWord, // 次のワードにレベルを設定
    typedWord: "",
    usedWords: [...state.usedWords, nextWord],
  }));

  // レベルの変更ロジック
  const levelOrder = [1, 2, 3, 4, 5];
  const currentLevelIndex = levelOrder.indexOf(currentLevel);
  const nextLevelIndex = (currentLevelIndex + 1) % levelOrder.length;
  set({ currentLevel: levelOrder[nextLevelIndex] });
};

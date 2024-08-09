import { StoreApi } from "zustand";

import useGameStore from "@/store/useGameStore";
import { GameState } from "@/types/gameState";
import { Word } from "@/types/word";

import {
  failureAudio,
  startAudio,
  stopAudio,
  successAudio,
  typingAudio,
} from "./audioActions";

/*
|--------------------------------------------------------------------------
| 経験値を追加
|--------------------------------------------------------------------------
*/
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
  set({ experience: newExperience, levelExperience: newLevelExperience });
};

/*
|--------------------------------------------------------------------------
| ゲームを開始
|--------------------------------------------------------------------------
*/
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
    progress: 0,
  });
  await selectNewWord();
  if (gameAudio) {
    gameAudio
      .play()
      .catch((error) => console.error("Audio playback failed:", error));
  }
};

/*
|--------------------------------------------------------------------------
| ゲームを終了
|--------------------------------------------------------------------------
*/
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

/*
|--------------------------------------------------------------------------
| ゲームをリセット
|--------------------------------------------------------------------------
*/
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
    levelExperience: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, // 各レベルの経験値をリセット
  });
};

/*
|--------------------------------------------------------------------------
| 新しいワードを選択
|--------------------------------------------------------------------------
*/
export const selectNewWord = async (
  set: StoreApi<GameState>["setState"],
  get: StoreApi<GameState>["getState"]
) => {
  console.log("新しいワードを選択");
  const {
    levels,
    usedWords,
    gameInProgress,
    currentLevel,
    levelWordCount,
    levelWordLimits,
  } = get();

  if (!gameInProgress) return;

  const currentLevelWords = levels[currentLevel - 1];
  const availableWords = currentLevelWords.filter(
    (word) => !usedWords.includes(word)
  );

  if (availableWords.length === 0) {
    set({ gameInProgress: false });
    return;
  }

  const newWord = availableWords[0]; // 順番に出題するため、最初のワードを選択

  if (newWord) {
    set((state) => ({
      currentWord: newWord, // 新しいワードを設定
      usedWords: [...state.usedWords, newWord], // 使用済みワードに追加
      levelWordCount: {
        ...state.levelWordCount,
        [currentLevel.toString()]:
          state.levelWordCount[currentLevel.toString()] + 1,
      },
    }));

    // レベルのワード数が制限に達したら次のレベルに進む
    if (
      levelWordCount[currentLevel.toString()] + 1 >=
      levelWordLimits[currentLevel]
    ) {
      const levelOrder = [1, 2, 3, 4, 5];
      const currentLevelIndex = levelOrder.indexOf(currentLevel);
      const nextLevelIndex =
        currentLevelIndex + 1 < levelOrder.length
          ? currentLevelIndex + 1
          : currentLevelIndex;
      const nextLevel = levelOrder[nextLevelIndex];

      const newWordsForNextLevel = levels[nextLevel - 1]
        .filter((word: Word) => !usedWords.includes(word))
        .slice(0, levelWordLimits[nextLevel]);
      set({
        currentLevel: nextLevel,
        wordsForCurrentLevel: newWordsForNextLevel,
        levelWordCount: { ...levelWordCount, [nextLevel]: 0 },
      });
    }
  }
};

/*
|--------------------------------------------------------------------------
| 次のワードを選択
|--------------------------------------------------------------------------
*/
export const nextWord = (
  set: StoreApi<GameState>["setState"],
  get: StoreApi<GameState>["getState"]
) => {
  const {
    currentLevel,
    wordsForCurrentLevel,
    usedWords,
    levelWordCount,
    levelWordLimits,
  } = get();

  if (wordsForCurrentLevel.length === 0) {
    // 次のレベルに進む
    const levelOrder = [1, 2, 3, 4, 5];
    const currentLevelIndex = levelOrder.indexOf(currentLevel);
    const nextLevelIndex =
      levelWordCount[currentLevel.toString()] >= levelWordLimits[currentLevel]
        ? currentLevelIndex + 1 < levelOrder.length
          ? currentLevelIndex + 1
          : currentLevelIndex
        : currentLevelIndex;
    const nextLevel = levelOrder[nextLevelIndex];

    // 新しいレベルのワードをセット
    const newWordsForNextLevel = get()
      .levels[nextLevel - 1].filter((word: Word) => !usedWords.includes(word))
      .slice(0, levelWordLimits[nextLevel]);
    set({
      currentLevel: nextLevel,
      wordsForCurrentLevel: newWordsForNextLevel,
      levelWordCount: { ...levelWordCount, [nextLevel]: 0 },
    });
  } else {
    // 次のワードをセット
    const nextWord = wordsForCurrentLevel.shift();
    if (nextWord) {
      set({
        currentWord: nextWord,
        wordsForCurrentLevel,
        usedWords: [...usedWords, nextWord],
        levelWordCount: {
          ...levelWordCount,
          [currentLevel]: levelWordCount[currentLevel] + 1,
        },
      });
    }
  }
};

/*
|--------------------------------------------------------------------------
| タイピング処理
|--------------------------------------------------------------------------
*/
export const handleTyping = (
  set: StoreApi<GameState>["setState"],
  get: StoreApi<GameState>["getState"]
) => {
  return (input: string) => {
    const {
      currentWord,
      typedWord,
      selectNewWord,
      currentLevel,
      resetProgressBar,
    } = get(); // resetProgressBarを取得
    if (!currentWord) return;

    const matchedRomaji = currentWord.romaji.find((romaji) =>
      romaji.startsWith(typedWord + input)
    );

    if (matchedRomaji) {
      console.log("マッチしたローマ字:", matchedRomaji);
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

          return {
            score: state.score + (currentWord.score || 0),
            levelExperience: newLevelExperience,
          };
        });

        console.log("タイピング成功:", currentWord); // タイピング成功時のデバッグログ
        selectNewWord();
        set({ typedWord: "" });
        resetProgressBar(); // プログレスバーをリセット
        useGameStore.setState({ progress: 0 }); // プログレスバーをリセット
      }
    } else {
      set((state) => ({ missCount: state.missCount + 1 }));
      failureAudio(); // 失敗時に音声を再生
    }
  };
};

/*
|--------------------------------------------------------------------------
| レベル画面
|--------------------------------------------------------------------------
*/
import React, { useEffect } from "react";

import { useGameStore } from "@/store/useGameStore";

const LevelScreen: React.FC = () => {
  const {
    gameInProgress,
    currentWord,
    typedWord,
    score,
    timer,
    missCount,
    startGame,
    resetGame,
    playAudio,
    handleTyping,
  } = useGameStore((state) => ({
    gameInProgress: state.gameInProgress,
    currentWord: state.currentWord,
    typedWord: state.typedWord,
    score: state.score,
    timer: state.timer,
    missCount: state.missCount,
    startGame: state.startGame,
    resetGame: state.resetGame,
    playAudio: state.playAudio,
    handleTyping: state.handleTyping,
  }));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && !gameInProgress) {
        startGame();
      } else if (event.code === "Escape" && gameInProgress) {
        resetGame();
      } else if (gameInProgress) {
        handleTyping(event.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameInProgress, startGame, resetGame, handleTyping]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      {gameInProgress && (
        <div className="mx-auto my-8 text-center">
          <p className="text-xl mb-2">{currentWord?.furigana}</p>
          <p className="text-4xl font-semibold tracking-widest mb-1">
            {currentWord?.kanji}
          </p>
          <p className="text-2xl">
            {(
              currentWord?.romaji.find((r) => r.startsWith(typedWord)) ||
              currentWord?.romaji.find((r) => r === currentWord.romaji[0])
            )
              ?.split("")
              .map((char: string, index: number) => {
                if (typedWord.length > index && typedWord[index] !== char) {
                  playAudio();
                }
                return (
                  <span
                    key={index}
                    style={{
                      color:
                        typedWord.length > index && typedWord[index] === char
                          ? "red"
                          : "black",
                    }}
                  >
                    {char}
                  </span>
                );
              })}
          </p>
        </div>
      )}
      {!gameInProgress && (
        <div className="">
          <p className="flex justify-center text-2xl">
            タイピングではキーボードを使います
          </p>
          <p className="flex justify-center text-xl mt-4">
            スペースキーを押したらスタート！
          </p>
          <p className="text-lg mt-4">
            ゲーム中に「ESCキー」を押すと、スタート画面に戻ります
          </p>
        </div>
      )}
      {gameInProgress && (
        <div className="">
          <p className="mt-auto">Score: {score}</p>
          <p className="mt-auto">残り: {timer}秒</p>
          <p>ミスタイピング数: {missCount}</p>
        </div>
      )}
    </div>
  );
};

export default LevelScreen;

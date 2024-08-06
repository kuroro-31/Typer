/*
|--------------------------------------------------------------------------
| レベル画面
|--------------------------------------------------------------------------
*/
import React, { useEffect, useState } from 'react';

import useGameStore from '@/store/useGameStore';

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
    nextWord,
    levelExperience,
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
    nextWord: state.nextWord,
    levelExperience: state.levelExperience,
  }));

  const [progress, setProgress] = useState(0);

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

  useEffect(() => {
    if (!gameInProgress) return;

    const interval = setInterval(() => {
      useGameStore.setState((state) => {
        if (state.timer > 0) {
          return { timer: state.timer - 1 };
        } else {
          clearInterval(interval);
          state.endGame();
          return { timer: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameInProgress]);

  useEffect(() => {
    if (!gameInProgress) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev + 1 >= 6) {
          nextWord(); // 6秒経過したら次のワードに進む
          return 0;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(progressInterval);
  }, [gameInProgress]);

  useEffect(() => {
    // ワードが変わったタイミングでログを出力
    console.log(`Level experience:`, levelExperience);
  }, [currentWord]);

  return (
    <div className="w-full h-full flex flex-col items-center p-4">
      {gameInProgress && (
        <div className="w-full pl-2 pb-2 border-b">
          <p className="mt-auto text-2xl font-semibold">残り {timer}秒</p>
          <p className="mt-auto text-xl">
            レベル 1 のスコア: {levelExperience[1] || 0}
          </p>
          <p className="mt-auto text-xl">
            レベル 2 のスコア: {levelExperience[2] || 0}
          </p>
          <p className="mt-auto text-xl">
            レベル 3 のスコア: {levelExperience[3] || 0}
          </p>
          <p className="mt-auto text-xl">
            レベル 4 のスコア: {levelExperience[4] || 0}
          </p>
        </div>
      )}

      {gameInProgress && (
        // 6秒ごとにプログレスバーを進める
        <div className="w-full">
          <div className="w-full h-[10px] bg-[#F1F2F5] rounded overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{
                width: `${(progress / 5) * 100}%`,
                transition: progress === 0 ? "none" : "width 1s linear",
              }}
            ></div>
          </div>
        </div>
      )}

      {gameInProgress && (
        <div className="w-full h-full">
          <div
            className="w-full py-8 rounded-b-lg"
            style={{
              backgroundImage: `url(${gameInProgress ? "/level1.jpeg" : ""})`,
              backgroundSize: "cover",
              backgroundPosition: "center -180px",
            }}
          >
            {/* スライム */}
            <div className="w-full flex justify-center overflow-x-hidden pt-12">
              <img
                src="/slime1_1.png"
                alt="level"
                className="animate-bounce h-[100px]"
              />
            </div>
            <div className="w-full mx-auto mt-8 text-center px-20">
              <div className="bg-black w-full py-8 flex flex-col items-center justify-center text-white rounded-[12px]">
                {/* <p className="text-xl mb-2">{currentWord?.furigana}</p> */}
                <p className="text-2xl font-semibold tracking-widest">
                  {currentWord?.kanji}
                </p>
                <p className="text-xl">
                  {(
                    currentWord?.romaji.find((r) => r.startsWith(typedWord)) ||
                    currentWord?.romaji.find((r) => r === currentWord.romaji[0])
                  )
                    ?.split("")
                    .map((char: string, index: number) => {
                      if (
                        typedWord.length > index &&
                        typedWord[index] !== char
                      ) {
                        playAudio();
                      }
                      return (
                        <span
                          key={index}
                          style={{
                            color:
                              typedWord.length > index &&
                              typedWord[index] === char
                                ? "#333"
                                : "white",
                          }}
                        >
                          {char}
                        </span>
                      );
                    })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!gameInProgress && (
        <div className="h-full flex flex-col justify-center">
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

      {/* {gameInProgress && (
        <div className="">
          <p>ミスタイピング数: {missCount}</p>
        </div>
      )} */}
    </div>
  );
};

export default LevelScreen;
"use client";

import HomeScreen from "@/components/top/HomeScreen";
import LevelScreen from "@/components/top/LevelScreen";
import ResultScreen from "@/components/top/ResultScreen";
import { useGameStore } from "@/store/useGameStore";

export default function Home() {
  const {
    screen,
    setScreen,
    gameStarted,
    gameInProgress,
    timer,
    score,
    currentWord,
    typedWord,
    missCount,
    startGame,
  } = useGameStore((state) => ({
    screen: state.screen,
    setScreen: state.setScreen,
    gameStarted: state.gameStarted,
    gameInProgress: state.gameInProgress,
    timer: state.timer,
    score: state.score,
    currentWord: state.currentWord,
    typedWord: state.typedWord,
    missCount: state.missCount,
    startGame: state.startGame,
  }));

  return (
    <div className="mx-auto flex items-center">
      <div className="w-[500px] h-[420px] bg-white rounded-[17px] flex flex-col">
        <div className="h-full flex justify-center items-center">
          {screen === "home" && <HomeScreen />}
          {screen === "level" && <LevelScreen />}
          {screen === "result" && <ResultScreen />}{" "}
        </div>

        <div className="p-4 flex justify-end mt-auto">
          {screen !== "home" && (
            <button
              onClick={() => {
                setScreen("home");
                useGameStore.setState({ gameStarted: false });
                useGameStore.setState({ gameInProgress: null });
                useGameStore.setState({ typedWord: "" });
                useGameStore.setState({ usedWords: [] }); // 使用済みのワードをリセット
              }}
            >
              戻る
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

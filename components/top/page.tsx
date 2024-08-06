"use client";

import useGameStore from "@/store/useGameStore";

import HomeScreen from "./HomeScreen";
import LevelScreen from "./LevelScreen";
import ResultScreen from "./ResultScreen";

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
      <div className="relative w-[580px] h-[420px] bg-white rounded-xl flex flex-col shadow-md">
        <div className="h-full flex justify-center items-center">
          {screen === "home" && <HomeScreen />}
          {screen === "level" && <LevelScreen />}
          {screen === "result" && <ResultScreen />}{" "}
        </div>

        <div className="absolute bottom-0 right-0 p-6 inline-flex justify-end mt-auto text-lg">
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

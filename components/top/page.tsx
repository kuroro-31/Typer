"use client";
import { useState } from "react";

export default function Home() {
  const [screen, setScreen] = useState("home");

  const HomeScreen = () => (
    <div>
      <button onClick={() => setScreen("start")}>スタート</button>
      <button>遊び方</button>
      <button>設定</button>
    </div>
  );

  const StartScreen = () => (
    <div>
      <button onClick={() => setScreen("level")}>易しい</button>
      <button onClick={() => setScreen("level")}>普通</button>
      <button onClick={() => setScreen("level")}>難しい</button>
      <button onClick={() => setScreen("level")}>鬼</button>
    </div>
  );

  const LevelScreen = () => (
    <div>
      <p>スペースキーを押してスタート</p>
    </div>
  );

  return (
    <div className="mx-auto flex items-center">
      {/* ゲームの中身 */}
      <div className="w-[500px] h-[420px] bg-white">
        {screen === "home" && <HomeScreen />}
        {screen === "start" && <StartScreen />}
        {screen === "level" && <LevelScreen />}
      </div>
    </div>
  );
}

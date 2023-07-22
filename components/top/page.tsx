"use client";
import { useState } from "react";

export default function Home() {
  const [screen, setScreen] = useState("home");

  const HomeScreen = () => (
    <div className="flex justify-center">
      <div className="">
        <h2></h2>
      </div>
      <div className="inline-flex flex-col">
        <button onClick={() => setScreen("start")} className="btn">
          スタート
        </button>
        <button className="btn-border mt-2">遊び方</button>
        <button className="btn-border mt-2">設定</button>
      </div>
    </div>
  );

  const StartScreen = () => (
    <div className="flex justify-center">
      <div className="">
        <h2></h2>
      </div>
      <div className="inline-flex flex-col">
        <button onClick={() => setScreen("level")} className="btn-easy mt-2">
          易しい
        </button>
        <button onClick={() => setScreen("level")} className="btn-normal mt-2">
          普通
        </button>
        <button onClick={() => setScreen("level")} className="btn-hard mt-2">
          難しい
        </button>
        <button onClick={() => setScreen("level")} className="btn-oni mt-2">
          鬼
        </button>
      </div>
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
      <div className="w-[500px] h-[420px] bg-white rounded-[17px] p-4">
        {screen === "home" && <HomeScreen />}
        {screen === "start" && <StartScreen />}
        {screen === "level" && <LevelScreen />}
      </div>
    </div>
  );
}

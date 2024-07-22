/*
|--------------------------------------------------------------------------
| ホーム画面
|--------------------------------------------------------------------------
*/
import React from "react";

import { useGameStore } from "@/store/useGameStore";

const HomeScreen: React.FC = () => {
  const setScreen = useGameStore((state) => state.setScreen);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">転生したらタイピングできてた件</h2>
      </div>
      <div className="inline-flex flex-col">
        <button
          onClick={() => {
            setScreen("level");
          }}
          className="btn"
        >
          スタート
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;

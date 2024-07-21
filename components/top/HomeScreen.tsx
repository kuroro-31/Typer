import React from "react";

import { useGameStore } from "@/store/useGameStore";

const HomeScreen: React.FC = () => {
  const setScreen = useGameStore((state) => state.setScreen);

  return (
    <div className="flex justify-center">
      <div className="">
        <h2></h2>
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
        <button className="btn-border mt-2">遊び方</button>
        <button className="btn-border mt-2">設定</button>
      </div>
    </div>
  );
};

export default HomeScreen;

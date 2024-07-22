/*
|--------------------------------------------------------------------------
| 結果発表画面
|--------------------------------------------------------------------------
*/
import React from "react";

import { useGameStore } from "@/store/useGameStore"; // インポート追加

const ResultScreen: React.FC = () => {
  const score = useGameStore((state) => state.score); // スコアを取得

  return (
    <div className="h-full flex flex-col justify-center items-center p-4">
      <p>ゲーム終了！</p>
      <p className="text-2xl font-semibold">スコア: {score}</p>
      <button
        onClick={() => {
          const url = `https://twitter.com/intent/tweet?text=私のスコアは${score}点でした！&url=${window.location.href}&hashtags=タイピングゲーム`;
          window.open(url, "_blank");
        }}
        className="bg-twitter text-white px-4 py-2 rounded-md mt-4"
      >
        Twitterでシェア
      </button>
    </div>
  );
};

export default ResultScreen;

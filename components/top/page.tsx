"use client";
import { useEffect, useMemo, useRef, useState } from "react";

import { Word } from "@/types/word";

import easyWords from "./words/easy";
import hardWords from "./words/hard";
import normalWords from "./words/normal";
import oniWords from "./words/oni";

export default function Home() {
  const [screen, setScreen] = useState("home");
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<
    "easy" | "normal" | "hard" | "oni" | null
  >(null);
  const [gameInProgress, setGameInProgress] = useState<boolean | null>(null);
  const [timer, setTimer] = useState(120);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [typedWord, setTypedWord] = useState(""); // 追加: ユーザーがタイプしたワードを追跡
  const [successStreak, setSuccessStreak] = useState(0); // 追加: 連続成功回数を追跡
  const wordTimer = useRef<NodeJS.Timeout | null>(null);

  const startAudio = useMemo(() => {
    const audio = new Audio("/start.mp3");
    audio.volume = 0.4; // 50% volume
    return audio;
  }, []);

  const gameAudio = useMemo(() => {
    const audio = new Audio("/game.mp3");
    audio.volume = 0.25; // 50% volume
    return audio;
  }, []);

  useEffect(() => {
    if (screen === "start") {
      startAudio.play();
      gameAudio.pause();
    } else if (screen === "level" && gameStarted) {
      startAudio.pause();
      gameAudio.play();
    }
  }, [gameAudio, screen, startAudio, gameStarted]);

  useEffect(() => {
    const handleKeyDown = (event: { code: string }) => {
      if (event.code === "Space") {
        setGameStarted(true);
        setGameInProgress(true);
        // Select a new word based on the difficulty
        let wordList: string | any[];
        switch (difficulty) {
          case "easy":
            wordList = easyWords;
            break;
          case "normal":
            wordList = normalWords;
            break;
          case "hard":
            wordList = hardWords;
            break;
          case "oni":
            wordList = oniWords;
            break;
          default:
            wordList = [];
        }
        const newWord = wordList[Math.floor(Math.random() * wordList.length)];
        setCurrentWord(newWord);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [difficulty]);

  // 追加: ユーザーがキーボードで文字を入力したときの処理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameInProgress) {
        const nextTypedWord = typedWord + event.key;
        if (currentWord?.romaji.startsWith(nextTypedWord)) {
          setTypedWord(nextTypedWord);
          if (nextTypedWord === currentWord?.romaji) {
            setScore((prevScore) => prevScore + 1);
            setTypedWord("");
            // Select a new word based on the difficulty
            let wordList: string | any[];
            switch (difficulty) {
              case "easy":
                wordList = easyWords;
                break;
              case "normal":
                wordList = normalWords;
                break;
              case "hard":
                wordList = hardWords;
                break;
              case "oni":
                wordList = oniWords;
                break;
              default:
                wordList = [];
            }
            const newWord =
              wordList[Math.floor(Math.random() * wordList.length)];
            setCurrentWord(newWord);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameInProgress, currentWord, typedWord, difficulty]);

  const HomeScreen = () => (
    <div className="flex justify-center">
      <div className="">
        <h2></h2>
      </div>
      <div className="inline-flex flex-col">
        <button
          onClick={() => {
            setScreen("start");
            startAudio.play();
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

  const StartScreen = () => (
    <div className="flex justify-center">
      <div className="">
        <h2></h2>
      </div>
      <div className="inline-flex flex-col">
        <button
          onClick={() => {
            setScreen("level");
            setDifficulty("easy");
          }}
          className="btn-easy mt-2"
        >
          易しい
        </button>
        <button
          onClick={() => {
            setScreen("level");
            setDifficulty("normal");
          }}
          className="btn-normal mt-2"
        >
          普通
        </button>
        <button
          onClick={() => {
            setScreen("level");
            setDifficulty("hard");
          }}
          className="btn-hard mt-2"
        >
          難しい
        </button>
        <button
          onClick={() => {
            setScreen("level");
            setDifficulty("oni");
          }}
          className="btn-oni mt-2"
        >
          鬼
        </button>
      </div>
    </div>
  );

  const LevelScreen = () => (
    <div className="h-full flex flex-col p-4">
      {gameInProgress && (
        <div className="mx-auto my-8 text-center">
          <p>{currentWord?.furigana}</p>
          <p className="text-2xl font-semibold">{currentWord?.kanji}</p>
          <p>
            {currentWord?.romaji.split("").map((char, index) => (
              <span
                key={index}
                style={{ color: typedWord.length > index ? "red" : "black" }}
              >
                {char}
              </span>
            ))}
          </p>
        </div>
      )}

      {!gameInProgress && <p>スペースキーを押してスタート</p>}

      {gameInProgress && <p className="mt-auto">Score: {score}</p>}
    </div>
  );

  useEffect(() => {
    if (gameStarted && gameInProgress) {
      // Start the game timer
      const timerId = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      // End the game when the timer reaches 0
      if (timer === 0) {
        setGameInProgress(false);
        clearInterval(timerId);
        if (wordTimer.current) {
          clearInterval(wordTimer.current);
        }
      }

      return () => clearInterval(timerId);
    }
  }, [gameStarted, gameInProgress, timer]);

  return (
    <div className="mx-auto flex items-center">
      {/* ゲームの中身 */}
      <div className="w-[500px] h-[420px] bg-white rounded-[17px] flex flex-col">
        <div className="">
          {screen === "home" && <HomeScreen />}
          {screen === "start" && <StartScreen />}
          {screen === "level" && <LevelScreen />}
        </div>

        <div className="p-4 flex justify-end mt-auto">
          {screen !== "home" && (
            <button onClick={() => setScreen("home")}>戻る</button>
          )}
        </div>
      </div>
    </div>
  );
}

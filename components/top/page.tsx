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
  const [timer, setTimer] = useState(60);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [typedWord, setTypedWord] = useState(""); // ユーザーがタイプしたワードを追跡
  const [successStreak, setSuccessStreak] = useState(0); // 連続成功回数を追跡
  const [countdown, setCountdown] = useState(3); // カウントダウンの初期値を3に設定
  const wordTimer = useRef<NodeJS.Timeout | null>(null);
  const countdownTimer = useRef<NodeJS.Timeout | null>(null); // カウントダウンタイマーの参照を追加

  const gameAudio = useMemo(() => {
    const audio = new Audio("/game.mp3");
    audio.volume = 0.1; // 50% volume
    return audio;
  }, []);

  const typeAudio = useMemo(() => {
    const audio = new Audio("/type.mov");
    audio.volume = 1; // 50% volume
    return audio;
  }, []);

  const successAudio = useMemo(() => {
    const audio = new Audio("/success.mov");
    audio.volume = 0.4; // 50% volume
    return audio;
  }, []);

  const missAudio = useMemo(() => {
    const audio = new Audio("/miss.mov");
    audio.volume = 0.5; // 50% volume
    return audio;
  }, []);

  const bonusAudio = useMemo(() => {
    const audio = new Audio("/bonus.mov");
    audio.volume = 0.5; // 50% volume
    return audio;
  }, []);

  const failureAudio = useMemo(() => {
    const audio = new Audio("/failure.mp3");
    audio.volume = 0.5; // 50% volume
    return audio;
  }, []);

  const resultAudio = useMemo(() => {
    const audio = new Audio("/result.mp3");
    audio.volume = 0.9; // 50% volume
    return audio;
  }, []);

  const countdownAudio = useMemo(() => {
    const audio = new Audio("/countdown.mp3");
    audio.volume = 0.5; // 50% volume
    return audio;
  }, []);

  useEffect(() => {
    if (screen === "level" && gameStarted) {
      gameAudio.currentTime = 0; // 音楽が切り替わる場合、必ず最初から再生されるようにする
      gameAudio.play();
    } else if (screen === "home" || screen === "result") {
      gameAudio.pause();
    }
  }, [gameAudio, screen, gameStarted]);

  useEffect(() => {
    const handleKeyDown = (event: { code: string }) => {
      if (event.code === "Space" && screen === "level") {
        setGameStarted(true);
        countdownAudio.play(); // カウントダウン音を再生
        countdownTimer.current = setInterval(() => {
          setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000); // 1秒ごとにカウントダウンを進行
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [countdownAudio, difficulty, screen]);

  // カウントダウンが0になったらゲームを開始
  useEffect(() => {
    if (countdown === 0) {
      setGameInProgress(true);
      clearInterval(countdownTimer.current);
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
  }, [countdown, difficulty]);

  // ユーザーがキーボードで文字を入力したときの処理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameInProgress) {
        const nextTypedWord = typedWord + event.key;
        if (currentWord?.romaji.startsWith(nextTypedWord)) {
          typeAudio.play(); // Play typing sound
          setTypedWord(nextTypedWord);
          setSuccessStreak((prevStreak) => prevStreak + 1); // Increment success streak
          if (successStreak >= 10) {
            bonusAudio.play(); // Play bonus sound
            setTimer((prevTimer) => prevTimer + 1); // Add bonus time
            setSuccessStreak(0); // Reset success streak
          }
          if (nextTypedWord === currentWord?.romaji) {
            successAudio.play(); // Play success sound
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
        } else {
          missAudio.play(); // Play miss sound
          setTimer((prevTimer) => Math.max(prevTimer - 1, 0)); // Subtract time for miss
          setSuccessStreak(0); // Reset success streak
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    gameInProgress,
    currentWord,
    typedWord,
    difficulty,
    typeAudio,
    successAudio,
    missAudio,
    bonusAudio,
    successStreak,
  ]);

  // 5秒間で1ワードの全ての文字をキーボード入力できなかったら、public/failure.mp3を流して次のワードを出す
  useEffect(() => {
    if (gameInProgress) {
      wordTimer.current = setTimeout(() => {
        failureAudio.play();
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
        const newWord = wordList[Math.floor(Math.random() * wordList.length)];
        setCurrentWord(newWord);
      }, 5000);
    }

    return () => {
      if (wordTimer.current) {
        clearTimeout(wordTimer.current);
      }
    };
  }, [gameInProgress, difficulty, failureAudio]);

  const HomeScreen = () => (
    <div className="flex justify-center">
      <div className="">
        <h2></h2>
      </div>
      <div className="inline-flex flex-col">
        <button
          onClick={() => {
            setScreen("start");
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
      {!gameInProgress && screen === "level" && (
        <p className="flex justify-center">スペースキーを押してスタート</p>
      )}
      {gameInProgress && <p className="mt-auto">Score: {score}</p>}
      <p className="mt-auto">残り: {timer}秒</p>
    </div>
  );

  const ResultScreen = () => (
    <div className="h-full flex flex-col p-4">
      <div className="mx-auto my-8 text-center">
        <p>ゲーム終了！</p>
        <p className="text-2xl font-semibold">スコア: {score}</p>
        <button
          onClick={() => {
            // SNSシェア機能を追加
            const url = `https://twitter.com/intent/tweet?text=私のスコアは${score}点でした！&url=${window.location.href}&hashtags=タイピングゲーム`;
            window.open(url, "_blank");
          }}
          className="bg-twitter text-white px-4 py-2 rounded-md mt-4"
        >
          Twitterでシェア
        </button>
      </div>
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
        setScreen("result"); // ゲーム終了時に結果画面に遷移
        resultAudio.play(); // 結果発表の画面になったら、public/result.mp3を再生する
        clearInterval(timerId);
        if (wordTimer.current) {
          clearInterval(wordTimer.current);
        }
      }

      return () => clearInterval(timerId);
    }
  }, [gameStarted, gameInProgress, timer, resultAudio]);

  return (
    <div className="mx-auto flex items-center">
      {/* ゲームの中身 */}
      <div className="w-[500px] h-[420px] bg-white rounded-[17px] flex flex-col">
        <div className="h-full flex justify-center items-center">
          {screen === "home" && <HomeScreen />}
          {screen === "start" && <StartScreen />}
          {screen === "level" && <LevelScreen />}
          {screen === "result" && <ResultScreen />} {/* 結果画面を追加 */}
        </div>

        <div className="p-4 flex justify-end mt-auto">
          {screen !== "home" && (
            <button
              onClick={() => {
                setScreen("home");
                setGameStarted(false);
                setGameInProgress(null);
                setTimer(60);
                setScore(0);
                setCurrentWord(null);
                setTypedWord("");
                setSuccessStreak(0);
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

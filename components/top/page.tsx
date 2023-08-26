"use client";
import {
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  const [successCharStreak, setSuccessCharStreak] = useState(0); // 連続成功文字数を追跡
  const wordTimer = useRef<NodeJS.Timeout | null>(null);
  const wordStartTime = useRef<Date | null>(null); // ワード開始時間を追跡
  // ボーナス用の連続成功文字数を追跡するためのステート変数
  const [successCharStreakForBonus, setSuccessCharStreakForBonus] =
    useState<number>(0);
  const [missCount, setMissCount] = useState(0); // ミス回数を追跡
  const [bonusSeconds, setBonusSeconds] = useState(0); // ボーナス秒数を追跡

  const gameAudio = useMemo(() => {
    const audio = new Audio("/game.mp3");
    audio.volume = 0.1; // 50% volume
    return audio;
  }, []);

  const minusAudio = useMemo(() => {
    const audio = new Audio("/minus.mp3");
    audio.volume = 1; // 50% volume
    return audio;
  }, []);

  const stopAudio = useMemo(() => {
    const audio = new Audio("/stop.mp3");
    audio.volume = 0.5; // 50% volume
    return audio;
  }, []);

  const countdownAudio = useMemo(() => {
    const audio = new Audio("/countdown.mov");
    audio.volume = 0.5; // 50% volume
    return audio;
  }, []);

  // ボーナス用の連続成功文字数をリセット
  const resetBonusStreak = () => {
    setSuccessCharStreakForBonus(0);
  };

  // スタート画面での音楽の処理
  useEffect(() => {
    if (screen === "start") {
      new Audio("/start.mp3").currentTime = 0; // 音楽が切り替わる場合、必ず最初から再生されるようにする
      gameAudio.pause();
    } else if (screen === "level" && gameStarted) {
      gameAudio.currentTime = 0; // 音楽が切り替わる場合、必ず最初から再生されるようにする
      gameAudio.play();
    } else if (screen === "home" || screen === "result") {
      gameAudio.pause();
    }
  }, [gameAudio, screen, gameStarted]);

  // スペースキーを押した時の処理
  useEffect(() => {
    const handleKeyDown = (event: { code: string }) => {
      if (event.code === "Space" && screen === "level") {
        setGameStarted(true);
        setGameInProgress(true);
        new Audio("/start.mp3").play(); // スペースキーをクリックした後にstart.mp3を流す

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
        wordStartTime.current = new Date(); // ワード開始時間を記録
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [difficulty, screen]);

  // 新しいワードを選択する関数
  const selectNewWord = useCallback(() => {
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
    wordStartTime.current = new Date(); // ワード開始時間を記録
  }, [difficulty]);

  // 5秒間で1ワードの全ての文字をキーボード入力できなかったら、public/failure.mp3を流して次のワードを出す
  useEffect(() => {
    if (gameInProgress) {
      if (wordTimer.current) {
        clearTimeout(wordTimer.current);
      }

      wordTimer.current = setTimeout(() => {
        const now = new Date();
        if (
          wordStartTime.current &&
          now.getTime() - wordStartTime.current.getTime() >= 5000
        ) {
          // 5秒以上経過していたら
          new Audio("/failure.mp3").play();
          setScore((prevScore) => prevScore - 1); // スコアを1点減算
          setTypedWord("");
          selectNewWord();
        }
      }, 5000 - (Date.now() - (wordStartTime.current?.getTime() || 0))); // ここを修正

      return () => {
        if (wordTimer.current) {
          clearTimeout(wordTimer.current);
        }
      };
    }
  }, [gameInProgress, difficulty, typedWord, currentWord, selectNewWord]);

  // ユーザーがキーボードで文字を入力したときの処理
  useEffect(() => {
    const handleKeyDown = (event: { key: any[] | SetStateAction<string> }) => {
      if (gameInProgress && event.key.length === 1) {
        const newTypedWord = typedWord + event.key;

        if (newTypedWord === currentWord?.romaji) {
          // ユーザーが現在のワードを全て入力した場合
          setTypedWord("");
          new Audio("/success.mov").play();
          // ... (その他の成功時の処理)
          setScore((prevScore) => prevScore + 1);
          selectNewWord();
          setSuccessStreak((prevStreak) => prevStreak + 1);

          if (
            successCharStreakForBonus % 10 === 0 &&
            successCharStreakForBonus !== 0
          ) {
            const bonusSecondsToAdd = Math.floor(
              successCharStreakForBonus / 10
            );
            setTimer((prevTimer) => prevTimer + bonusSecondsToAdd);
            setBonusSeconds((prevBonus) => prevBonus + bonusSecondsToAdd);
            new Audio("/bonus.mov").play();
          }
        } else if (currentWord?.romaji.startsWith(newTypedWord)) {
          // ユーザーが正しい文字を入力した場合
          setTypedWord(newTypedWord);
          new Audio("/type.mov").play();
          setSuccessCharStreak((prevStreak) => prevStreak + 1);
          setSuccessCharStreakForBonus((prevStreak) => prevStreak + 1);
          setSuccessStreak(0);
        } else {
          // ユーザーが間違った文字を入力した場合
          new Audio("/miss.mov").play();
          setTimer((prevTimer) => prevTimer - 1);
          setSuccessCharStreak(0);
          setSuccessCharStreakForBonus(0);
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
    selectNewWord,
    successStreak,
    successCharStreak,
    successCharStreakForBonus,
  ]);

  // ゲーム中のescを押した時の処理
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setScreen("level");
        setGameInProgress(false);
        setGameStarted(false); // ゲーム開始状態をリセット
        setTimer(60); // タイマーをリセット
        setScore(0); // スコアをリセット
        setCurrentWord(null); // 現在のワードをリセット
        setTypedWord(""); // 入力されたワードをリセット
        setSuccessStreak(0); // 連続成功回数をリセット
        setSuccessCharStreak(0); // 連続成功文字数をリセット
        setSuccessCharStreakForBonus(0); // ボーナス用の連続成功文字数をリセット
        setMissCount(0); // ミスタイピング回数を0にリセット

        // すべての音声を停止
        [gameAudio].forEach((audio) => {
          audio.pause();
          audio.currentTime = 0;
        });
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [gameAudio]);

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

  // プログレスバーとポップアップを表示するコンポーネント
  const ProgressBarAndPopup = ({
    successCharStreakForBonus,
  }: {
    successCharStreakForBonus: number;
  }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [currentBonusSeconds, setCurrentBonusSeconds] = useState(0); // 現在のボーナス秒数を保持するステート変数

    useEffect(() => {
      if (
        successCharStreakForBonus % 10 === 0 &&
        successCharStreakForBonus !== 0
      ) {
        setShowPopup(true);
        const bonusSecondsToAdd = Math.floor(successCharStreakForBonus / 10);
        setCurrentBonusSeconds(bonusSecondsToAdd); // 現在のボーナス秒数を更新
        setTimeout(() => setShowPopup(false), 2000); // 2秒後にポップアップを非表示にする
      }
    }, [successCharStreakForBonus]);

    return (
      <div>
        <div
          style={{
            height: "20px",
            width: `${(successCharStreakForBonus % 10) * 10}%`,
            backgroundColor: "blue",
          }}
        />
        {showPopup && <div>{currentBonusSeconds}秒加算されました！</div>}
      </div>
    );
  };

  // ゲーム中の画面
  const LevelScreen = () => (
    <div className="h-full flex flex-col items-center justify-center p-4">
      {gameInProgress && (
        <div className="mx-auto my-8 text-center">
          <ProgressBarAndPopup
            successCharStreakForBonus={successCharStreakForBonus}
          />
          <p>{currentWord?.furigana}</p>
          <p className="text-2xl font-semibold">{currentWord?.kanji}</p>
          <p>
            {currentWord?.romaji.split("").map((char, index) => {
              // Check if the typed character is incorrect and play the miss audio
              if (typedWord.length > index && typedWord[index] !== char) {
                new Audio("/miss.mov").play();
              }
              return (
                <span
                  key={index}
                  style={{
                    color:
                      typedWord.length > index && typedWord[index] === char
                        ? "red"
                        : "blacak",
                  }}
                >
                  {char}
                </span>
              );
            })}
          </p>
        </div>
      )}
      {!gameInProgress && screen === "level" && (
        <div className="">
          <p className="flex justify-center text-xl">
            タイピングではキーボードを使います
          </p>
          <p className="flex justify-center text-lg mt-4">
            スペースキーを押したらスタート！
          </p>
          <p className="mt-4">
            ゲーム中に「ESCキー」を押すと、スタート画面に戻ります
          </p>
        </div>
      )}
      {gameInProgress && (
        <div className="">
          <p className="mt-auto">Score: {score}</p>
          <p className="mt-auto">残り: {timer}秒</p>
          <p className="mt-auto">連続成功文字数: {successCharStreak}</p>
          <p>ミスタイピング数: {missCount}</p>
          <p>ボーナス秒数: {bonusSeconds}</p> {/* 累計のボーナス秒数を表示 */}
        </div>
      )}
    </div>
  );

  // ゲーム結果画面
  const ResultScreen = () => (
    <div className="h-full flex flex-col justify-center items-center p-4">
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
  );

  // ゲーム中のタイマー処理
  useEffect(() => {
    if (gameStarted && gameInProgress) {
      // Start the game timer
      const timerId = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 0) {
            stopAudio.play(); // 残り時間が0になったら、stop.mp3を再生する
            return 0; // 残り時間が0を通り過ぎてマイナスにならないようにする
          } else if (prevTimer === 4) {
            countdownAudio.play();
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [gameStarted, gameInProgress, stopAudio, countdownAudio]);

  // ゲーム終了時の処理
  useEffect(() => {
    if (gameStarted) {
      // End the game when the timer reaches 0
      if (timer <= 0) {
        setGameInProgress(false);
        setScreen("result"); // ゲーム終了時に結果画面に遷移
        if (score < 0) {
          minusAudio.play(); // スコアがマイナスの場合、minus.mp3を再生する
        } else {
          new Audio("/result.mp3").play(); // スコアが0以上の場合、result.mp3を再生する
        }
        if (wordTimer.current) {
          clearInterval(wordTimer.current);
        }
      }
    }
  }, [gameStarted, timer, minusAudio, score]);

  /* ゲームの中身 */
  return (
    <div className="mx-auto flex items-center">
      <div className="w-[500px] h-[420px] bg-white rounded-[17px] flex flex-col">
        <div className="h-full flex justify-center items-center">
          {screen === "home" && <HomeScreen />}
          {screen === "start" && <StartScreen />}
          {screen === "level" && <LevelScreen />}
          {screen === "result" && <ResultScreen />}
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
                resetBonusStreak();
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

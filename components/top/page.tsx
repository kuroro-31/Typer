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

// ワードのリストをlevel_1.tsからlevel_50.tsまでインポート
const levels = Array.from(
  { length: 50 },
  (_, i) => import(`./words/level_${i + 1}`)
);

export default function Home() {
  const [screen, setScreen] = useState("home");
  const [gameStarted, setGameStarted] = useState(false);
  const [gameInProgress, setGameInProgress] = useState<boolean | null>(null);
  const [timer, setTimer] = useState(120);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState<Word | null>(null);
  const [typedWord, setTypedWord] = useState(""); // ユーザーがタイプしたワードを追跡
  const wordTimer = useRef<NodeJS.Timeout | null>(null);
  const wordStartTime = useRef<Date | null>(null); // ワード開始時間を追跡
  const [missCount, setMissCount] = useState(0); // ミス回数を追跡
  const [level, setLevel] = useState(1);
  const [wordsForCurrentLevel, setWordsForCurrentLevel] = useState<string[]>(
    []
  );

  const gameAudio = useMemo(() => {
    const audio = new Audio("/game.mp3");
    audio.volume = 0.1;
    return audio;
  }, []);

  // レベルに基づいてワードリストをセットする関数
  const setWordsForLevel = useCallback(async () => {
    const currentLevelWordsModule = await levels[level - 1];
    const currentLevelWords: Word[] = currentLevelWordsModule.default;
    const selectedWords: Word[] = [];

    while (selectedWords.length < 5) {
      const randomWordIndex = Math.floor(
        Math.random() * currentLevelWords.length
      );
      const randomWord = currentLevelWords[randomWordIndex];
      if (!selectedWords.includes(randomWord)) {
        selectedWords.push(randomWord);
        currentLevelWords.splice(randomWordIndex, 1); // 使用したワードをリストから削除
      }
    }

    const selectedWordStrings = selectedWords.map((word) => word.romaji);
    setWordsForCurrentLevel(selectedWordStrings);
  }, [level]);

  // 新しいワードを選択する関数
  const selectNewWord = useCallback(() => {
    if (wordsForCurrentLevel.length === 0) {
      setLevel((prevLevel) => Math.min(prevLevel + 1, 50));
      setWordsForLevel();
    }

    const newWord = wordsForCurrentLevel.pop();
    if (newWord) {
      setCurrentWord({ kanji: newWord, furigana: "", romaji: newWord }); // Placeholder: Assigning newWord to kanji and romaji fields, this needs to be adjusted based on correct structure of Word
    }
    wordStartTime.current = new Date();
  }, [wordsForCurrentLevel, setWordsForLevel]);

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

        // Select a new word based on the current level
        setWordsForLevel();

        const newWordRomaji =
          wordsForCurrentLevel[
            Math.floor(Math.random() * wordsForCurrentLevel.length)
          ];
        const newWord: Word = {
          kanji: newWordRomaji, // この部分は適切な値に置き換える必要があります
          furigana: "", // この部分は適切な値に置き換える必要があります
          romaji: newWordRomaji,
        };
        setCurrentWord(newWord);
        wordStartTime.current = new Date(); // ワード開始時間を記録
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [screen, setWordsForLevel, wordsForCurrentLevel]);

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
  }, [gameInProgress, typedWord, currentWord, selectNewWord]);

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
        } else if (currentWord?.romaji.startsWith(newTypedWord)) {
          // ユーザーが正しい文字を入力した場合
          setTypedWord(newTypedWord);
          new Audio("/type.mov").play();
        } else {
          // ユーザーが間違った文字を入力した場合
          new Audio("/miss.mov").play();
          setTimer((prevTimer) => prevTimer - 1);
          setMissCount((prevCount) => prevCount + 1); // ミスタイピング数を増やす
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameInProgress, currentWord, typedWord, selectNewWord]);

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

  useEffect(() => {
    setWordsForLevel();
  }, [level, setWordsForLevel]);

  const HomeScreen = () => (
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

  // ゲーム中の画面
  const LevelScreen = () => (
    <div className="h-full flex flex-col items-center justify-center p-4">
      {gameInProgress && (
        <div className="mx-auto my-8 text-center">
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
          <p>ミスタイピング数: {missCount}</p>
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
            new Audio("/stop.mp3").play(); // 残り時間が0になったら、stop.mp3を再生する
            return 0; // 残り時間が0を通り過ぎてマイナスにならないようにする
          } else if (prevTimer === 4) {
            new Audio("/countdown.mov").play();
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => clearInterval(timerId);
    }
  }, [gameStarted, gameInProgress]);

  // ゲーム終了時の処理
  useEffect(() => {
    if (gameStarted) {
      // End the game when the timer reaches 0
      if (timer <= 0) {
        setGameInProgress(false);
        setScreen("result"); // ゲーム終了時に結果画面に遷移
        if (score < 0) {
          new Audio("/minus.mp3").play(); // スコアがマイナスの場合、minus.mp3を再生する
        } else {
          new Audio("/result.mp3").play(); // スコアが0以上の場合、result.mp3を再生する
        }
        if (wordTimer.current) {
          clearInterval(wordTimer.current);
        }
      }
    }
  }, [gameStarted, timer, score]);

  /* ゲームの中身 */
  return (
    <div className="mx-auto flex items-center">
      <div className="w-[500px] h-[420px] bg-white rounded-[17px] flex flex-col">
        <div className="h-full flex justify-center items-center">
          {screen === "home" && <HomeScreen />}
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
                setTimer(120);
                setScore(0);
                setCurrentWord(null);
                setTypedWord("");
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

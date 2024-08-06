import { Word } from '@/types/word';

export interface GameState {
  screen: string;
  gameAudio: HTMLAudioElement | null;
  gameStarted: boolean;
  gameInProgress: boolean | null;
  timer: number;
  score: number;
  currentWord: Word | null;
  typedWord: string;
  missCount: number;
  level: number;
  levels: Word[][];
  wordsForCurrentLevel: Word[];
  usedWords: Word[];
  progress: number; // プログレスバーのプロパティを追加
  setScreen: (screen: string) => void;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  handleTyping: (input: string) => void;
  selectNewWord: () => void;
  failureAudio: () => void;
  stopAudio: () => void;
  resetProgressBar: () => void; // プログレスバーのリセット関数を追加
  playAudio: () => void; // playAudio関数を追加
  nextWord: () => void; // nextWord関数を追加
  currentLevel: number; // 現在のレベル
  experience: number; // 総経験値
  levelExperience: { [key: number]: number }; // 各レベルの経験値
}

import { Word } from "@/types/word";

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
  setScreen: (screen: string) => void;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  handleTyping: (input: string) => void;
  selectNewWord: () => void;
  failureAudio: () => void;
  stopAudio: () => void;
}

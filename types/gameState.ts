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
  progress: number;
  progressBar: number;
  currentLevel: number;
  experience: number;
  levelExperience: { [key: number]: number };
  levelWordCount: { [key: string]: number };
  levelWordLimits: { [key: number]: number };
  setScreen: (screen: string) => void;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  handleTyping: (input: string) => void;
  selectNewWord: () => void;
  nextWord: () => void;
  resetProgressBar: () => void;
  setProgress: (progress: number) => void;
  failureAudio: () => void;
  stopAudio: () => void;
  playAudio: () => void;
  addExperience: (level: number) => void;
}

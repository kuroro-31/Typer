/*
|--------------------------------------------------------------------------
| 音声の設定
|--------------------------------------------------------------------------
*/
export const startAudio = () => {
  const audio = new Audio("./start.mp3");
  audio.play().catch((error) => console.error("Audio playback failed:", error));
};

export const successAudio = () => {
  const audio = new Audio("./success.mov");
  audio.play().catch((error) => console.error("Audio playback failed:", error));
};

export const failureAudio = () => {
  const audio = new Audio("./failure.mp3");
  audio.play().catch((error) => console.error("Audio playback failed:", error));
};

export const typingAudio = () => {
  const audio = new Audio("./type.mp3");
  audio.play().catch((error) => console.error("Audio playback failed:", error));
};

export const stopAudio = (gameAudio: HTMLAudioElement | null) => {
  if (gameAudio) {
    gameAudio.pause();
    gameAudio.currentTime = 0;
  }
};

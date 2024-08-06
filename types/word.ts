/*
|--------------------------------------------------------------------------
| タイピングの単語
|--------------------------------------------------------------------------
*/
export interface Word {
  kanji: string;
  furigana: string;
  romaji: string[];
  level?: number; // levelプロパティ
  score?: number;
}

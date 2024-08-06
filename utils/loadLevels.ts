/*
|--------------------------------------------------------------------------
| ゲームで使用するレベルを読み込む
|--------------------------------------------------------------------------
*/
export const loadLevels = async () => {
  const levels = await Promise.all([
    import(`@/components/top/words/level_1`),
    import(`@/components/top/words/level_2`),
    import(`@/components/top/words/level_3`),
    import(`@/components/top/words/level_4`),
    // import(`@/components/top/words/level_2`),
  ]);
  return levels.map((module) => module.default);
};

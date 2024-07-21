export const loadLevels = async () => {
  const levels = await Promise.all([
    import(`@/components/top/words/level_1`),
    // 必要な他のレベルもここに追加
  ]);
  return levels.map((module) => module.default);
};

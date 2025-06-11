export const generateSelectKey = (arr = []) => {
  return arr?.map((data, idx) => ({
    ...data,
    selectKey: idx,
  }));
};

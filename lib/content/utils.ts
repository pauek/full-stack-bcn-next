
export const range = (from: number, to: number) => {
  const result = [];
  for (; from < to; from++) result.push(from);
  return result;
}
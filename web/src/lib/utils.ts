export const formatHash = (hash: string, length = 12) => {
  if (!hash) return "";
  if (hash.length <= length) return hash;
  return `${hash.slice(0, length / 2)}...${hash.slice(-length / 2)}`;
};

export const generateTime = (days: number) =>
  Math.floor(Date.now() / 1000) + 24 * days * 3600

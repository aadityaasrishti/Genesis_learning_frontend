export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  // Using fixed saturation and lightness for good readability
  const saturation = 70; // 70% saturation for vivid but not too bright colors
  const lightness = 45; // 45% lightness for good contrast with white text

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

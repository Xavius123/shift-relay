/** "1 photo", "3 photos": a count with its noun, made plural by adding an s. */
export function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

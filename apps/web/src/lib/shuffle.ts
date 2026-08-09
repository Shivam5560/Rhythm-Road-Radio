export function pickShuffleIndex(playlistLength: number, currentIndex: number): number {
  if (playlistLength <= 1) return 0;
  let next = currentIndex;
  while (next === currentIndex) {
    next = Math.floor(Math.random() * playlistLength);
  }
  return next;
}

export class ShuffleHistory {
  private stack: number[] = [];

  push(index: number): void {
    this.stack.push(index);
  }

  popPrevious(): number | null {
    this.stack.pop(); // drop the current track
    const previous = this.stack.pop();
    return previous ?? null;
  }

  clear(): void {
    this.stack = [];
  }
}

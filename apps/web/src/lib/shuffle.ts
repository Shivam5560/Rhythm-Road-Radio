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

  get length(): number {
    return this.stack.length;
  }

  popPrevious(): number | null {
    if (this.stack.length <= 1) return null;
    this.stack.pop(); // drop the current track
    return this.stack[this.stack.length - 1] ?? null; // peek the new current, leave it on the stack so repeated calls keep walking back
  }

  clear(): void {
    this.stack = [];
  }
}

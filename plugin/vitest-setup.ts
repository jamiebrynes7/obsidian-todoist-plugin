import "@testing-library/jest-dom/vitest";

// Obsidian adds Array.prototype.remove; polyfill it for tests.
declare global {
  interface Array<T> {
    remove(item: T): void;
  }
}

if (!Array.prototype.remove) {
  Array.prototype.remove = function <T>(this: T[], item: T): void {
    const index = this.indexOf(item);
    if (index > -1) {
      this.splice(index, 1);
    }
  };
}

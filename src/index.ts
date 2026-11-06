export type Comparator<T> = (a: T, b: T) => number;
export interface HeapOptions {
  maxSize?: number;
}
interface Entry<T> {
  value: T;
  id: number;
}
export class BinaryHeap<T> {
  private readonly entries: Entry<T>[] = [];
  private readonly positions = new Map<number, number>();
  private nextId = 0;
  private readonly limit: number;
  constructor(
    private readonly comparator: Comparator<T>,
    options: HeapOptions = {},
  ) {
    if (typeof comparator !== 'function') throw new TypeError('Expected comparator');
    this.limit = options.maxSize ?? 1000000;
    if (!Number.isSafeInteger(this.limit) || this.limit < 0 || this.limit > 10000000)
      throw new RangeError('Invalid maxSize');
  }
  get size(): number {
    return this.entries.length;
  }
  peek(): T | undefined {
    return this.entries[0]?.value;
  }
  private compare(a: Entry<T>, b: Entry<T>): number {
    const result = this.comparator(a.value, b.value);
    if (!Number.isFinite(result)) throw new RangeError('Comparator must return a finite number');
    return result === 0 ? a.id - b.id : result;
  }
  private place(index: number, entry: Entry<T>, length: number): void {
    const path: number[] = [];
    let cursor = index;
    if (cursor > 0 && this.compare(entry, this.entries[Math.floor((cursor - 1) / 2)]!) < 0) {
      while (cursor > 0) {
        const parent = Math.floor((cursor - 1) / 2);
        if (this.compare(entry, this.entries[parent]!) >= 0) break;
        path.push(parent);
        cursor = parent;
      }
    } else {
      while (cursor * 2 + 1 < length) {
        let child = cursor * 2 + 1;
        if (child + 1 < length && this.compare(this.entries[child + 1]!, this.entries[child]!) < 0)
          child++;
        if (this.compare(entry, this.entries[child]!) <= 0) break;
        path.push(child);
        cursor = child;
      }
    }
    cursor = index;
    for (const next of path) {
      this.entries[cursor] = this.entries[next]!;
      this.positions.set(this.entries[cursor]!.id, cursor);
      cursor = next;
    }
    this.entries[cursor] = entry;
    this.positions.set(entry.id, cursor);
  }
  push(value: T): number {
    if (this.size >= this.limit || !Number.isSafeInteger(this.nextId + 1))
      throw new RangeError('Heap capacity exceeded');
    const entry = { value, id: this.nextId };
    this.compare(entry, entry);
    this.place(this.size, entry, this.size + 1);
    this.nextId++;
    return entry.id;
  }
  update(handle: number, value: T): void {
    const index = this.positions.get(handle);
    if (index === undefined) throw new RangeError('Unknown heap handle');
    const entry = { value, id: handle };
    this.compare(entry, entry);
    this.place(index, entry, this.size);
  }
  pop(): T | undefined {
    const first = this.entries[0];
    if (!first) return undefined;
    const last = this.entries[this.size - 1]!;
    if (this.size > 1) this.place(0, last, this.size - 1);
    this.entries.pop();
    this.positions.delete(first.id);
    return first.value;
  }
  clear(): void {
    this.entries.length = 0;
    this.positions.clear();
  }
}

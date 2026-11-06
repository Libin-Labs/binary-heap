import { BinaryHeap, type Comparator, type HeapOptions } from '@lp-labs/binary-heap';
export type PublicTypes = [Comparator<number>, HeapOptions];
void BinaryHeap;
const heap = new BinaryHeap<number>((a, b) => a - b);
const handle: number = heap.push(2);
heap.update(handle, 1);
// @ts-expect-error numeric heap rejects strings
heap.push('x');

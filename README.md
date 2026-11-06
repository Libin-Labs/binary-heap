# @lp-labs/binary-heap

Stable generic binary min-heaps with addressable updates. Zero runtime and peer dependencies. MIT. Node.js 18+; ES2022-compatible browser runtimes with BigInt where used. No browser globals accessed at import.

## Install

```sh
npm install @lp-labs/binary-heap
```

## Quick start

```js
import { BinaryHeap } from '@lp-labs/binary-heap';
const heap = new BinaryHeap((a, b) => a.priority - b.priority);
const handle = heap.push({ priority: 5, label: 'work' });
heap.update(handle, { priority: 1, label: 'urgent' });
console.log(heap.pop());
```

ES modules use named imports above. CommonJS uses `const { BinaryHeap } = require('@lp-labs/binary-heap');`. Both formats ship declarations.

## Public API and customization

- `Comparator<T>`: pure, non-reentrant, total ordering callback returning a finite number (negative means earlier).
- `HeapOptions`: optional `maxSize`, default 1,000,000, maximum 10,000,000.
- `BinaryHeap<T>(comparator, options?)`: stable min-heap. `size`, `peek(): T | undefined`, `push(value): number` (opaque per-instance handle), `pop(): T | undefined`, `update(handle,value): void`, `clear(): void`.
- Updates preserve original insertion age on ties. Handles are never reused by a heap; never mix handles between heaps.

All runtime exports and public declaration types are listed above. Options are per call/instance; no global configuration.

## Errors, ownership and limits

RangeError for bad limits, exhausted capacity/handle counter, unknown handles or nonfinite comparator results; TypeError for a nonfunction comparator. Comparisons are planned before mutation, so a thrown/nonfinite comparison leaves structure intact. Comparator consistency and no mutation/reentrancy are caller obligations. Values are references: change priorities only via update. Push/pop/update O(log n), peek O(1), clear O(n), space O(n). No sorted iterator.

Algorithms are synchronous and CPU/memory bounded by the stated limits, not cancellable or real-time. Validation does not sandbox hostile getters, proxies, callbacks or infinite iterables. TypeScript signatures are the supported input contract. No I/O, network, persistence or cryptographic guarantees.

## Development

```sh
npm ci --offline
npm run build
npm run typecheck
npm test
npm run format:check
```

Strict TypeScript, ESM/CommonJS, bare installed-package consumers with negative type assertions, and deterministic reference-oracle tests are included. Only TypeScript and Prettier are development dependencies.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.

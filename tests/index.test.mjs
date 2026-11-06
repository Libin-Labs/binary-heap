import test from 'node:test';
import assert from 'node:assert/strict';
import * as lib from '../dist/esm/index.js';
function random(seed = 123456789) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
test('min ordering and empty', () => {
  const h = new lib.BinaryHeap((a, b) => a - b);
  [4, 1, 7, -1, 2].forEach((x) => h.push(x));
  assert.equal(h.peek(), -1);
  assert.deepEqual(
    Array.from({ length: 5 }, () => h.pop()),
    [-1, 1, 2, 4, 7],
  );
  assert.equal(h.pop(), undefined);
});
test('stable equal priorities', () => {
  const h = new lib.BinaryHeap((a, b) => a.p - b.p);
  h.push({ p: 1, id: 'a' });
  h.push({ p: 1, id: 'b' });
  assert.equal(h.pop().id, 'a');
  assert.equal(h.pop().id, 'b');
});
test('addressed updates both directions preserve age', () => {
  const h = new lib.BinaryHeap((a, b) => a - b);
  const a = h.push(9);
  const b = h.push(3);
  h.push(5);
  h.update(a, 1);
  assert.equal(h.pop(), 1);
  h.update(b, 8);
  assert.deepEqual([h.pop(), h.pop()], [5, 8]);
  assert.throws(() => h.update(a, 0), RangeError);
});
test('failed comparator is atomic', () => {
  let fail = false;
  const h = new lib.BinaryHeap((a, b) => (fail ? NaN : a - b));
  h.push(2);
  h.push(1);
  fail = true;
  assert.throws(() => h.push(3), RangeError);
  assert.throws(() => h.update(0, 4), RangeError);
  fail = false;
  assert.deepEqual([h.pop(), h.pop()], [1, 2]);
});
test('failed deep planning leaves pushes pops and updates intact', () => {
  for (const operation of ['push', 'pop', 'update']) {
    let remaining = Infinity;
    const h = new lib.BinaryHeap((a, b) => {
      if (--remaining === 0) throw new Error('comparison failed');
      return a - b;
    });
    const handles = [4, 2, 6, 1, 3, 5, 7].map((x) => h.push(x));
    remaining = 3;
    assert.throws(() => {
      if (operation === 'push') h.push(0);
      else if (operation === 'pop') h.pop();
      else h.update(handles[6], 0);
    }, /comparison failed/);
    remaining = Infinity;
    assert.equal(h.size, 7);
    assert.deepEqual(
      Array.from({ length: 7 }, () => h.pop()),
      [1, 2, 3, 4, 5, 6, 7],
    );
  }
});
test('updates retain insertion age at equal priority', () => {
  const h = new lib.BinaryHeap((a, b) => a.priority - b.priority);
  const first = h.push({ priority: 2, label: 'first' });
  h.push({ priority: 1, label: 'second' });
  h.update(first, { priority: 1, label: 'first updated' });
  assert.equal(h.pop().label, 'first updated');
  assert.equal(h.pop().label, 'second');
});
test('bounds and stale handles', () => {
  const h = new lib.BinaryHeap((a, b) => a - b, { maxSize: 1 });
  const id = h.push(1);
  assert.throws(() => h.push(2), RangeError);
  h.clear();
  assert.equal(h.size, 0);
  assert.throws(() => h.update(id, 2), RangeError);
  assert.notEqual(h.push(2), id);
});
test('seeded sorted-list update oracle', () => {
  const rng = random();
  const h = new lib.BinaryHeap((a, b) => a - b);
  const rows = [];
  for (let i = 0; i < 500; i++) {
    if (rows.length && rng() < 0.4) {
      rows.sort((a, b) => a.v - b.v || a.id - b.id);
      assert.equal(h.pop(), rows.shift().v);
    } else if (rows.length && rng() < 0.4) {
      const row = rows[Math.floor(rng() * rows.length)];
      row.v = Math.floor(rng() * 50);
      h.update(row.id, row.v);
    } else {
      const v = Math.floor(rng() * 50);
      rows.push({ v, id: h.push(v) });
    }
  }
  rows.sort((a, b) => a.v - b.v || a.id - b.id);
  assert.deepEqual(
    rows.map(() => h.pop()),
    rows.map((x) => x.v),
  );
});

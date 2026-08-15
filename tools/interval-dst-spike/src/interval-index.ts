import IntervalTree from "@flatten-js/interval-tree";

export interface HalfOpenInterval {
  readonly start: number;
  readonly end: number;
}

export interface IntervalIndex<T> {
  readonly size: number;
  insert(interval: HalfOpenInterval, value: T): void;
  query(interval: HalfOpenInterval): readonly T[];
}

export interface IntervalIndexEntry<T> {
  readonly interval: HalfOpenInterval;
  readonly value: T;
}

interface StoredEntry<T> extends IntervalIndexEntry<T> {
  readonly insertionOrder: number;
}

function assertNonEmptyInterval(interval: HalfOpenInterval): void {
  if (
    !Number.isFinite(interval.start) ||
    !Number.isFinite(interval.end) ||
    interval.start >= interval.end
  ) {
    throw new RangeError(
      `Expected a finite, non-empty half-open interval; received [${interval.start}, ${interval.end})`,
    );
  }
}

function intersects(left: HalfOpenInterval, right: HalfOpenInterval): boolean {
  return left.start < right.end && left.end > right.start;
}

/**
 * Candidate adapter. @flatten-js/interval-tree uses closed intersection, so
 * results are filtered at this seam to enforce Time's [start, end) contract.
 * No dependency-owned type appears in the interface or return value.
 */
export class FlattenIntervalIndex<T> implements IntervalIndex<T> {
  readonly #tree = new IntervalTree<StoredEntry<T>>();
  #nextInsertionOrder = 0;

  constructor(entries: readonly IntervalIndexEntry<T>[] = []) {
    for (const entry of entries) {
      this.insert(entry.interval, entry.value);
    }
  }

  get size(): number {
    return this.#tree.size;
  }

  insert(interval: HalfOpenInterval, value: T): void {
    assertNonEmptyInterval(interval);

    const stored: StoredEntry<T> = {
      insertionOrder: this.#nextInsertionOrder,
      interval: { start: interval.start, end: interval.end },
      value,
    };

    this.#nextInsertionOrder += 1;
    this.#tree.insert([interval.start, interval.end], stored);
  }

  query(interval: HalfOpenInterval): readonly T[] {
    assertNonEmptyInterval(interval);

    // The candidate's search is closed at both ends. Filtering is deliberate:
    // [0, 10) must not intersect [10, 20), even though the tree returns it as
    // a candidate. Sorting makes the wrapper deterministic by insertion order.
    return this.#tree
      .search([interval.start, interval.end])
      .filter((entry) => intersects(entry.interval, interval))
      .sort((left, right) => left.insertionOrder - right.insertionOrder)
      .map((entry) => entry.value);
  }
}

/** Simple O(n) oracle used by property tests and the target-scale benchmark. */
export class ScanIntervalIndex<T> implements IntervalIndex<T> {
  readonly #entries: StoredEntry<T>[] = [];
  #nextInsertionOrder = 0;

  constructor(entries: readonly IntervalIndexEntry<T>[] = []) {
    for (const entry of entries) {
      this.insert(entry.interval, entry.value);
    }
  }

  get size(): number {
    return this.#entries.length;
  }

  insert(interval: HalfOpenInterval, value: T): void {
    assertNonEmptyInterval(interval);
    this.#entries.push({
      insertionOrder: this.#nextInsertionOrder,
      interval: { start: interval.start, end: interval.end },
      value,
    });
    this.#nextInsertionOrder += 1;
  }

  query(interval: HalfOpenInterval): readonly T[] {
    assertNonEmptyInterval(interval);
    const matches: T[] = [];

    for (const entry of this.#entries) {
      if (intersects(entry.interval, interval)) {
        matches.push(entry.value);
      }
    }

    return matches;
  }
}

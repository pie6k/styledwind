import { getObjectHash } from "../objectHash";

const NO_LAST_KEY = Symbol("NO_LAST_KEY");

const MAX_CACHE_SIZE = 10_000;

export class HashMap<K, V> {
  private map: Map<number, V> = new Map();

  constructor(entries?: Iterable<readonly [K, V]>) {
    if (!entries) return;

    for (const [key, value] of entries) {
      this.map.set(getObjectHash(key), value);
    }
  }

  private lastKey: K | typeof NO_LAST_KEY = NO_LAST_KEY;
  private lastKeyHash: number | null = null;

  private removeFirstN(n: number) {
    for (const key of this.map.keys()) {
      this.map.delete(key);
      n--;
      if (n <= 0) break;
    }
  }

  private getKey(key: K) {
    /**
     * It is likely that we are getting the same key at least twice in a row (eg .has, > get, > set)
     * This will prevent us from recalculating the hash twice
     *
     * Assumption: keys are immutable
     */
    if (this.lastKey === key) return this.lastKeyHash!;

    const hash = getObjectHash(key);

    this.lastKey = key;
    this.lastKeyHash = hash;

    return hash;
  }

  has(key: K) {
    return this.map.has(this.getKey(key));
  }

  get(key: K) {
    return this.map.get(this.getKey(key));
  }

  set(key: K, value: V) {
    if (this.map.size >= MAX_CACHE_SIZE) {
      this.removeFirstN(1);
    }

    return this.map.set(this.getKey(key), value);
  }

  delete(key: K) {
    if (this.lastKey === key) {
      this.lastKey = NO_LAST_KEY;
      this.lastKeyHash = null;
    }

    return this.map.delete(this.getKey(key));
  }
}

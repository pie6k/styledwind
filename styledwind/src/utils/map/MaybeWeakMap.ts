import { isPrimitive } from "./utils";

export class MaybeWeakMap<K, V> {
  private readonly weakMap = new WeakMap<K & object, V>();
  private readonly map = new Map<K, V>();

  private getMapForKey(key: K): Map<K, V> {
    if (isPrimitive(key)) {
      return this.map;
    } else {
      return this.weakMap as Map<K, V>;
    }
  }

  get(key: K): V | undefined {
    return this.getMapForKey(key).get(key);
  }

  set(key: K, value: V): this {
    this.getMapForKey(key).set(key, value);
    return this;
  }

  has(key: K): boolean {
    return this.getMapForKey(key).has(key);
  }

  delete(key: K): boolean {
    return this.getMapForKey(key).delete(key);
  }

  clear(): void {
    this.map.clear();
  }
}

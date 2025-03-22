import { deepEqual } from "fast-equals";
import { isPrimitive } from "./utils";

export class EqualKeyMap<K, V> extends Map<K, V> {
  private lookupCache = new WeakMap<K & object, K>();
  constructor(
    private isEqual: (a: K, b: K) => boolean = deepEqual,
    entries?: Iterable<readonly [K, V]>,
  ) {
    super(entries);
  }

  getOrReuseKey(inputKey: K) {
    if (super.has(inputKey)) {
      return inputKey;
    }

    let key = inputKey;

    if (!isPrimitive(inputKey)) {
      if (this.lookupCache.has(inputKey as K & object)) {
        key = this.lookupCache.get(inputKey as K & object)!;
      }
    }

    if (!super.has(inputKey)) {
      for (let existingKey of this.keys()) {
        if (this.isEqual(existingKey, inputKey)) {
          key = existingKey;
        }
      }
    }

    if (!isPrimitive(inputKey)) {
      this.lookupCache.set(inputKey as K & object, key);
    }

    return key;
  }

  has(key: K) {
    key = this.getOrReuseKey(key);

    return super.has(key);
  }

  get(key: K) {
    key = this.getOrReuseKey(key);

    return super.get(key);
  }

  set(key: K, value: V) {
    key = this.getOrReuseKey(key);

    return super.set(key, value);
  }

  delete(key: K) {
    key = this.getOrReuseKey(key);

    return super.delete(key);
  }
}

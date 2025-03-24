import { deepEqual, shallowEqual } from "fast-equals";

export function createValueReuser<T>() {
  const values: T[] = [];

  return function getReused(value: T): T {
    for (const cached of values) {
      if (deepEqual(cached, value)) {
        return cached;
      }
    }

    values.push(value);

    return value;
  };
}

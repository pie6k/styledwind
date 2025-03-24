import { deepEqual } from "fast-equals";

export function createValueReuser<T>() {
  const values: T[] = [];

  return function getReused<I extends T>(value: I): I {
    for (const cached of values) {
      if (deepEqual(cached, value)) {
        return cached as I;
      }
    }

    values.unshift(value);

    return value;
  };
}

export type ValueReuser<T> = ReturnType<typeof createValueReuser<T>>;

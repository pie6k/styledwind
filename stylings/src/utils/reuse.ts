import { deepEqual } from "fast-equals";
import { JSONValue } from "./json";

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

export type ValueReuser<T extends JSONValue> = ReturnType<typeof createValueReuser<T>>;

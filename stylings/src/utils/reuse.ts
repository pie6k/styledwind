import { HashMap } from "./map/HashMap";

export function createValueReuser<T>() {
  const map = new HashMap<T, T>();

  return function getReused<I extends T>(value: I): I {
    if (map.has(value)) return map.get(value) as I;

    map.set(value, value);

    return value;
  };
}

export type ValueReuser<T> = ReturnType<typeof createValueReuser<T>>;

import { DeepMap, MapLikeContructor } from "./map/DeepMap";

import { HashMap } from "./map/HashMap";
import { MaybeWeakMap } from "./map/MaybeWeakMap";

type MemoizeKeysMode = "maybeWeak" | "default" | "weak" | "hash";

interface MemoizeOptions {
  mode?: MemoizeKeysMode;
}

function getMapToUse<K, V>(mode?: MemoizeKeysMode): MapLikeContructor<K, V> {
  if (mode === "default") return Map;
  if (mode === "maybeWeak") return MaybeWeakMap;
  if (mode === "hash") return HashMap;
  if (mode === "weak") return WeakMap;

  return Map;
}

type AnyFunction = (...args: any[]) => any;

interface MemoizedFunctionExtra<F extends AnyFunction> {
  remove: (...args: Parameters<F>) => void;
}

export type MemoizedFunction<F extends AnyFunction> = F & MemoizedFunctionExtra<F>;

/**
 * Lodash memoize is based on serialization and is only using first arguments as cache keys
 */
export function memoizeFn<F extends AnyFunction>(callback: F, options?: MemoizeOptions): MemoizedFunction<F> {
  type A = Parameters<F>;
  type R = ReturnType<F>;
  const deepMap = new DeepMap(getMapToUse<A, R>(options?.mode));

  const getMemoized = (...args: A): R => {
    const result = deepMap.getOrCreateCallback<A>(callback, ...args);

    return result;
  };

  const remove = (...args: A): void => {
    deepMap.delete(args);
  };

  getMemoized.remove = remove;

  return getMemoized as MemoizedFunction<F>;
}

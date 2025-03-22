import { DeepMap, MapLikeContructor } from "./map/DeepMap";
import { EqualKeyMap } from "./map/EqualKeyMap";
import { MaybeWeakMap } from "./map/MaybeWeakMap";

type MemoizeKeysMode = "maybeWeak" | "equal" | "default" | "weak";

interface MemoizeOptions {
  mode?: MemoizeKeysMode;
}

function getMapToUse<K, V>(mode: MemoizeKeysMode): MapLikeContructor<K, V> {
  switch (mode) {
    case "maybeWeak":
      return MaybeWeakMap<K, V>;
    case "equal":
      return EqualKeyMap<K, V>;
    case "weak":
      return WeakMap<K & object, V>;
    default:
      return Map<K, V>;
  }
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
  const deepMap = new DeepMap(getMapToUse<A, R>(options?.mode ?? "maybeWeak"));

  function getMemoized(...args: A): R {
    const result = deepMap.getOrCreateCallback<A>(callback, ...args);

    return result;
  }

  function remove(...args: A): void {
    deepMap.delete(args);
  }

  getMemoized.remove = remove;

  return getMemoized as MemoizedFunction<F>;
}

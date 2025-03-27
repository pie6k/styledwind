const targetSymbol = { symbol: Symbol("DEEP_MAP_TARGET") };
const undefinedSymbol = { symbol: Symbol("DEEP_MAP_UNDEFINED") };

export interface MapLike<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear?(): void;
}

export type MapLikeContructor<K, V> = new () => MapLike<K, V>;

type DeepMapLeaf<V> = MapLike<unknown, DeepMapLeaf<V> | V>;

export class DeepMap<V> {
  readonly root: DeepMapLeaf<V>;

  constructor(private MapToUse: MapLikeContructor<unknown, V> = Map) {
    this.root = new MapToUse();
  }

  private getFinalTargetMapIfExists(path: unknown[]) {
    let currentTarget = this.root;

    for (let part of path) {
      if (part === undefined) part = undefinedSymbol;

      if (currentTarget.has(part)) {
        currentTarget = currentTarget.get(part)! as DeepMapLeaf<V>;
        continue;
      }

      return null;
    }

    return currentTarget;
  }

  private getFinalTargetMap(path: unknown[]) {
    let currentTarget = this.root;

    const { MapToUse } = this;

    for (let part of path) {
      if (part === undefined) part = undefinedSymbol;

      const targetLeaf = currentTarget.get(part) as DeepMapLeaf<V> | undefined;

      if (targetLeaf !== undefined) {
        currentTarget = targetLeaf;
        continue;
      }

      const nestedMap: DeepMapLeaf<V> = new MapToUse();

      currentTarget.set(part, nestedMap);
      currentTarget = nestedMap;
    }

    return currentTarget;
  }

  getForArgs(...path: unknown[]) {
    const targetMap = this.getFinalTargetMapIfExists(path);

    if (targetMap === null) return undefined;

    return targetMap.get(targetSymbol) as V | undefined;
  }

  get(path: unknown[]) {
    return this.getForArgs(...path);
  }

  getOrCreate<P extends unknown[]>(path: P, create: (path: P) => V) {
    const targetMap = this.getFinalTargetMap(path);

    const maybeResult = targetMap.get(targetSymbol) as V | undefined;

    if (maybeResult !== undefined) return maybeResult;

    if (targetMap.has(targetSymbol)) return undefined;

    const result = create(path);

    targetMap.set(targetSymbol, result);

    return result;
  }

  getOrCreateCallback<P extends unknown[]>(create: (...path: P) => V, ...path: P) {
    const targetMap = this.getFinalTargetMap(path);

    if (targetMap.has(targetSymbol)) {
      return targetMap.get(targetSymbol) as V;
    }

    const newResult = create(...path);

    targetMap.set(targetSymbol, newResult);

    return newResult;
  }

  boundGetOrCreateCallback<P extends unknown[]>(boundTo: any, create: (...path: P) => V, ...path: P) {
    const targetMap = this.getFinalTargetMap(path);

    if (targetMap.has(targetSymbol)) {
      return targetMap.get(targetSymbol) as V;
    }

    const newResult = Reflect.apply(create, boundTo, path);

    targetMap.set(targetSymbol, newResult);

    return newResult;
  }

  set(path: unknown[], value: V) {
    const targetMap = this.getFinalTargetMap(path);

    targetMap.set(targetSymbol, value);
  }

  getAndHas(path: unknown[]): [V, true] | [undefined, false] {
    const targetMap = this.getFinalTargetMapIfExists(path);

    if (!targetMap) {
      return [undefined, false];
    }

    if (!targetMap.has(targetSymbol)) {
      return [undefined, false];
    }

    return [targetMap.get(targetSymbol) as V, true];
  }

  has(path: unknown[]) {
    const targetMap = this.getFinalTargetMapIfExists(path);

    if (targetMap === null) return false;

    return targetMap.has(targetSymbol);
  }

  delete(path: unknown[]) {
    const targetMap = this.getFinalTargetMapIfExists(path);

    if (targetMap === null) return false;

    return targetMap.delete(targetSymbol);
  }
}

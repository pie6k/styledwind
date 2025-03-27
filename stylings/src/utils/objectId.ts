let id = 1;

const objectIdMap = new WeakMap<WeakKey, number>();

export function getObjectId<T extends WeakKey>(obj: T): number {
  const cached = objectIdMap.get(obj);

  if (cached) return cached;

  const newId = id++;

  objectIdMap.set(obj, newId);

  return newId;
}

export type MaybeArray<T> = T | T[];

export function convertMaybeArrayToArray<T>(maybeArray: MaybeArray<T>): T[] {
  if (Array.isArray(maybeArray)) {
    return [...maybeArray];
  }

  return [maybeArray];
}

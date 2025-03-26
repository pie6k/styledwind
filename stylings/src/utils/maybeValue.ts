export const NO_VALUE_SYMBOL = Symbol("NO_VALUE");

export type MaybeValue<T> = T | typeof NO_VALUE_SYMBOL;

export function getHasValue<T>(value: MaybeValue<T>): value is T {
  return value !== NO_VALUE_SYMBOL;
}

export function maybeValue<T>(initial: MaybeValue<T> = NO_VALUE_SYMBOL) {
  return initial;
}

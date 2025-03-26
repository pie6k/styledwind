export type ValueUpdater<T> = Partial<T> | ((value: T) => void);

export function produceValue<T>(value: T, updater: ValueUpdater<T>): T {
  if (typeof updater === "function") {
    const clone = structuredClone(value);
    updater(clone);
    return clone;
  }

  return { ...value, ...updater };
}

export function updateValue<T>(value: T, updater: ValueUpdater<T>): void {
  if (typeof updater === "function") {
    updater(value);
  } else {
    Object.assign(value as {}, updater);
  }
}

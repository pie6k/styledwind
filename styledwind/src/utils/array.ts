const NO_CHANGE = Symbol("noChange");
const REMOVE = Symbol("remove");

type MutationResult<T> = T | typeof NO_CHANGE | typeof REMOVE;

const mutationController = {
  noChange: NO_CHANGE,
  remove: REMOVE,
} as const;

type MutationController = typeof mutationController;

export function mutateArray<T>(
  array: T[],
  getMutated: (item: T, index: number, controller: MutationController) => MutationResult<T>,
) {
  for (let i = 0; i < array.length; i++) {
    const result = getMutated(array[i], i, mutationController);

    if (result === NO_CHANGE) continue;

    if (result === REMOVE) {
      array.splice(i, 1);
      i--;
      continue;
    }

    array[i] = result;
  }
}

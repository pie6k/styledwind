import { isPrimitive } from "./primitive";

function flattenObject<T extends object>(ob: T) {
  var toReturn: Record<string, any> = {};

  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;

    if (typeof ob[i] == "object") {
      var flatObject = flattenObject(ob[i] as object);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;

        toReturn[i + "." + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

function getSingleCannonicalKey(input: unknown) {
  if (isPrimitive(input)) {
    return JSON.stringify(input);
  }

  const flatObject = flattenObject(input as object);

  const sortedKeys = Object.keys(flatObject).sort();

  return JSON.stringify(flatObject, sortedKeys);
}

/**
 * Get a canonical key for a given input.
 *
 * The canonical key is a string that uniquely identifies the input.
 * It is used to compare two inputs and determine if they are equal.
 *
 * Note that order of properties in the object is not important. Two objects with the same properties in different orders will have the same canonical key.
 */
export function getCanonicalKey(firstInput: unknown, ...inputs: unknown[]): string {
  if (!inputs.length) {
    return getSingleCannonicalKey(firstInput);
  }

  if (!inputs.length) {
    return getSingleCannonicalKey(firstInput);
  }

  return getSingleCannonicalKey([firstInput, ...inputs]);
}

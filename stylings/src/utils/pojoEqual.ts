import { JSONArray, JSONValue } from "./json";

function compareArrays(a: JSONArray, b: JSONArray): boolean {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (!pojoEqual(a[i], b[i])) return false;
  }

  return true;
}

export function pojoEqual(a: JSONValue, b: JSONValue): boolean {
  if (a === b) return true;

  if (typeof a !== typeof b) return false;

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return false;

    return compareArrays(a, b);
  }

  if (Array.isArray(b)) return false;

  if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
    for (const key of Object.keys(a)) {
      if (!pojoEqual(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}

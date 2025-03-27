export type JSONPrimitive = string | number | boolean | null;
export type JSONArray = JSONValue[];
export type JSONValue = JSONPrimitive | JSONObject | JSONArray;
export interface JSONObject {
  [key: string]: JSONValue;
}

// Faster hash function with better string handling
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return hash;
}

/**
 * High-speed JSON object hash with minimal collisions.
 * Checks all properties strictly without creating function in call scope.
 */
export function getJSONHash(json: JSONObject): number {
  return getValueHash(json) >>> 0;
}

// Separate function to handle recursive hashing
function getValueHash(value: JSONValue): number {
  if (value === undefined) return 0;
  if (value === null) return 0;

  const type = typeof value;

  if (type === "number") return ~~value * 31;
  if (type === "boolean") return value ? 1231 : 1237; // Distinct prime values

  if (type === "string") {
    // Use full string content for better distinction
    return hashString(value as string);
  }

  if (Array.isArray(value)) {
    let hash = 1;
    for (let i = 0; i < value.length; i++) {
      // Multiply by different prime for each position
      hash = hash * 31 + getValueHash(value[i]);
    }
    return hash;
  }

  // Must be an object
  const obj = value as JSONObject;
  let hash = 0;

  // Sort keys for consistent hashing
  const keys = Object.keys(obj).sort();

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    // Hash both the key and its value
    hash += hashString(key);
    hash += getValueHash(obj[key]);
  }

  return hash;
}

export function createJSONReuser() {
  const cache = new Map<number, JSONObject>();

  return function getReused<T extends JSONObject>(obj: T): T {
    const hash = getJSONHash(obj);

    const cached = cache.get(hash);

    if (cached) {
      return cached as T;
    }

    cache.set(hash, obj);

    return obj;
  };
}

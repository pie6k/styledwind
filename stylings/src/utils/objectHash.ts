import { getObjectId } from "./objectId";

// String hashing function
function hashString(str: string): number {
  let hash = 0;

  const length = str.length;

  for (let i = 0; i < length; i++) {
    // hash * 31 + char
    hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
  }
  return hash >>> 0; // Convert to unsigned 32-bit integer
}

/**
 * Enhanced JSON hash function that can handle any object.
 * Uses objectKey for non-plain objects.
 */
export function getObjectHash<T>(obj: T): number {
  return getValueHash(obj) >>> 0;
}

// Handle any value type for hashing
function getValueHash(value: any): number {
  if (value === undefined) return 0;
  if (value === null) return 1;

  const type = typeof value;

  if (type === "number") return ~~value * 31;
  if (type === "boolean") return value ? 1231 : 1237;
  if (type === "string") return hashString(value);
  if (type === "symbol") return getObjectId(value as symbol);
  if (type === "function") return getObjectId(value as Function);

  if (Array.isArray(value)) {
    let hash = value.length;
    for (const item of value) {
      hash = hash * 31 + getValueHash(item);
    }

    return hash;
  }

  if (type === "object") {
    // Check if it's a plain object or an instance of a class
    if (Object.getPrototypeOf(value) !== Object.prototype) {
      // Non-plain object - use the objectKey function
      return getObjectId(value) * 31;
    }

    // Plain object - proceed with normal hashing
    let hash = 3;
    for (const key in value) {
      hash += hashString(key);
      hash += getValueHash(value[key]);
    }

    return hash;
  }

  // For ther types, use a constant
  return 4;
}

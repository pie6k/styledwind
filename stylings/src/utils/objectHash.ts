import { getObjectId } from "./objectId";

// String hashing function
function hashString(str: string) {
  let length = str.length;
  let hash = 5381;

  for (let i = 0; i < length; ++i) {
    hash = 33 * hash + str.charCodeAt(i);
  }

  return hash;
}

/**
 * Enhanced JSON hash function that can handle any object.
 * Uses objectKey for non-plain objects.
 */
export function getObjectHash<T>(obj: T): number {
  return getValueHash(obj) >>> 0;
}

const UNDEFINED_HASH = hashString("undefined");
const NULL_HASH = hashString("null");
const NUMBER_HASH = hashString("number");
const BOOLEAN_HASH = hashString("boolean");
const STRING_HASH = hashString("string");
const SYMBOL_HASH = hashString("symbol");
const FUNCTION_HASH = hashString("function");
const ARRAY_HASH = hashString("array");
const OBJECT_HASH = hashString("object");
const BIGINT_HASH = hashString("bigint");

// Handle any value type for hashing
function getValueHash(value: any): number {
  const type = typeof value;

  switch (type) {
    case "undefined":
      return UNDEFINED_HASH;
    case "object": {
      if (value === null) return NULL_HASH;
      break;
    }
    case "number":
      return NUMBER_HASH + ~~value * 31;
    case "boolean":
      return BOOLEAN_HASH + (value ? 1231 : 1237);
    case "string":
      return STRING_HASH + hashString(value);
    case "symbol":
      return SYMBOL_HASH + getObjectId(value as symbol);
    case "function":
      return FUNCTION_HASH + getObjectId(value as Function);
    case "bigint":
      return BIGINT_HASH;
  }

  if (Array.isArray(value)) {
    let hash = ARRAY_HASH + value.length;
    for (const item of value) {
      hash = hash * 31 + getValueHash(item);
    }

    return hash;
  }

  // Check if it's a plain object or an instance of a class
  if (Object.getPrototypeOf(value) !== Object.prototype) {
    const nameHash = hashString(Object.getPrototypeOf(value).constructor.name);
    // Non-plain object - use the objectKey function
    return nameHash + getObjectId(value) * 31;
  }

  // Plain object - proceed with normal hashing
  let hash = OBJECT_HASH;

  for (const key in value) {
    hash += hashString(key) + getValueHash(value[key]);
  }

  return hash;
}

type PropertiesMapValue = unknown | NestedRecord;

type NestedRecord = {
  [key: string]: PropertiesMapValue;
};

export type PropertiesMap = Map<string, unknown>;

/**
 * Returns true only for plain, {} objects (not instances of classes, arrays, etc.)
 */
function getIsPlainObject(value: unknown): value is Record<string, unknown> {
  return value?.constructor === Object;
}

function buildPropertiesMap(currentPath: string, result: PropertiesMap, input: NestedRecord) {
  for (const key in input) {
    const path = currentPath ? `${currentPath}.${key}` : key;
    const value = input[key];

    if (getIsPlainObject(value)) {
      buildPropertiesMap(path, result, value);
    } else {
      result.set(path, value);
    }
  }
}

export function createNestedRecordPropertiesMap(input: NestedRecord): PropertiesMap {
  const map = new Map<string, unknown>();

  buildPropertiesMap("", map, input);

  return map;
}

function innerMapNestedRecord(
  currentPath: string,
  input: NestedRecord,
  mapper: (value: unknown, path: string) => unknown,
): NestedRecord {
  const result: NestedRecord = {};

  for (const key in input) {
    const path = currentPath ? `${currentPath}.${key}` : key;
    const value = input[key];

    if (getIsPlainObject(value)) {
      result[key] = innerMapNestedRecord(path, value, mapper);
    } else {
      result[key] = mapper(value, path);
    }
  }

  return result;
}

export function mapNestedRecord(input: NestedRecord, mapper: (value: unknown, path: string) => unknown): NestedRecord {
  return innerMapNestedRecord("", input, mapper);
}

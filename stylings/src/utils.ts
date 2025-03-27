interface ParsedUnit {
  value: number;
  unit?: string;
}

function parseUnit(value: Length): ParsedUnit {
  if (typeof value === "number") {
    return { value };
  }

  const numPartRegex = /^\d+(\.\d+)?/;

  const numPart = value.match(numPartRegex);

  if (!numPart) {
    throw new Error(`Invalid unit value: ${value}`);
  }

  const unitPart = value.slice(numPart[0].length);

  return { value: parseFloat(numPart[0]), unit: unitPart };
}

export function addUnit(value: number | string, unit: string = "rem") {
  if (typeof value === "number") {
    return `${value}${unit}`;
  }

  return value;
}

export function multiplyUnit(value: Length, multiplier: number, defaultUnit: string = "ms") {
  const { value: num, unit } = parseUnit(value);
  return `${num * multiplier}${unit || defaultUnit}`;
}

export type Length = string | number;

export function isInteger(value: number) {
  return Number.isInteger(value);
}

export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

type BaseUnit = "base" | "level";

type ConvertableUnit = "rem" | BaseUnit;

function levelToBase(level: number) {
  return Math.pow(2, level);
}

function baseToLevel(base: number) {
  return Math.log2(base);
}

function baseToRem(base: number) {
  return base * 0.25;
}

function remToBase(rem: number) {
  return rem / 0.25;
}

export function convertUnits(value: number, from: ConvertableUnit, to: ConvertableUnit): number {
  if (from === to) {
    return value;
  }

  let base: number;

  if (from === "base") {
    base = value;
  } else if (from === "level") {
    base = levelToBase(value);
  } else if (from === "rem") {
    base = remToBase(value);
  } else {
    throw new Error(`Unknown unit: ${from}`);
  }

  let result: number;

  if (to === "base") {
    result = base;
  } else if (to === "level") {
    result = baseToLevel(base);
  } else if (to === "rem") {
    result = baseToRem(base);
  } else {
    throw new Error(`Unknown unit: ${to}`);
  }

  return result;
}

export function convertToRem(value: number, from: BaseUnit) {
  return convertUnits(value, from, "rem");
}

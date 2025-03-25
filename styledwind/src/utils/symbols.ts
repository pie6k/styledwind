export function getIsSymbol(value: unknown): value is symbol {
  return typeof value === "symbol";
}

export function getIsWellKnownSymbol(value: unknown): value is symbol {
  if (!getIsSymbol(value)) {
    return false;
  }

  const str = value.toString();
  return str.startsWith("Symbol(") && str.endsWith(")");
}

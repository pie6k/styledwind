export type Primitive = string | number | boolean | undefined | null;

export function isPrimitive(value: unknown): value is Primitive {
  const type = typeof value;

  return type === "string" || type === "number" || type === "boolean" || value === undefined || value === null;
}

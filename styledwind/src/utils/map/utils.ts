export type Primitive = string | number | boolean | null | undefined;

export function isPrimitive(input: unknown): input is Primitive {
  const type = typeof input;

  if (input === null) return true;

  if (type === "object" || type === "function") {
    return false;
  }

  return true;
}

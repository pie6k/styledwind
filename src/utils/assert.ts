import { Falsy } from "./nullish";

type ErrorInput = string | Error;

function createError(input: ErrorInput) {
  if (typeof input === "string") {
    return new Error(input);
  }

  return input;
}

export function assertGet<T>(input: Falsy | T, error: ErrorInput): T {
  if (!input) {
    throw createError(error);
  }

  return input;
}

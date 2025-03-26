import { describe, expect, test } from "vitest";

import { $flex } from "@";

describe("flex", () => {
  test("basic", () => {
    expect($flex.vertical()).toMatchInlineSnapshot(`
      [
        "display: flex;",
        "flex-direction: column;",
      ]
    `);
  });

  test("gap", () => {
    expect($flex.vertical.gap(2)()).toMatchInlineSnapshot(`
      [
        "display: flex;",
        "flex-direction: column;",
        "gap: 1rem;",
      ]
    `);
  });
});

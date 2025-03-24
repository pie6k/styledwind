import { describe, expect, test } from "vitest";

import { animation } from "@";

describe("flex", () => {
  test("basic", () => {
    expect(animation.fadeIn.property("transform-y", [0, 1])()).toMatchInlineSnapshot(`
      [
        "; animation-name:",
        e {
          "id": "sc-keyframes-gNInrH",
          "inject": [Function],
          "name": "gNInrH",
          "rules": "0% { opacity: 0;
          transform: translate(var(--animate_x_0, 0), var(--animate_y_0, 0));
         } 100% { opacity: 1;
          transform: translate(var(--animate_x_100, 0), var(--animate_y_100, 0));
         } ",
        },
        ";",
        "animation-duration: 150ms;",
        "animation-timing-function: ease-in-out;",
        "will-change: transform, opacity;",
        "--animate_y_0: 0;",
        "--animate_y_100: 1;",
      ]
    `);
  });

  test("complex composer is memoized", () => {
    const composer1 = animation.fadeIn.property("transform-y", [0, 1]);
    const composer2 = animation.fadeIn.property("transform-y", [0, 1]);

    expect(composer1).toBe(composer2);
  });
});

import { ComposerStyle, getIsComposer } from "./Composer";
import { Interpolation, RuleSet, css } from "styled-components";

import { isNotNullish } from "./utils/nullish";
import { memoizeFn } from "./utils/memoize";
import { mutateArray } from "./utils/array";

export function simplifyRule(ruleSet: RuleSet) {
  mutateArray(ruleSet, (item, _index, controller) => {
    if (typeof item === "string") {
      const trimmed = item.trim().replace(/\s+/g, " ");

      if (trimmed.length === 0) return controller.remove;

      if (trimmed.length === item.length) return controller.noChange;

      return trimmed;
    }

    return controller.noChange;
  });

  return ruleSet;
}

export const compileComposerStyles = memoizeFn(
  (styles: ComposerStyle[]): RuleSet => {
    const precompiledStyles = styles
      .map((style) => {
        if (getIsComposer(style)) return style.compile();

        return style;
      })
      .filter(isNotNullish);

    // prettier-ignore
    const result = css`${precompiledStyles as Interpolation<object>}`;

    simplifyRule(result);

    return result;
  },
  { mode: "weak" },
);

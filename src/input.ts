import { ComponentPropsWithoutRef, ElementType, HTMLAttributes } from "react";

import { AnyStyledComposer } from "./Composer";
import { Falsy } from "./utils/nullish";

export type StylesInput = Falsy | AnyStyledComposer | Array<AnyStyledComposer>;

export type StyledStylesProps = {
  $styles?: StylesInput;
};

export type PropsWithStyles<T> = T & {
  styles?: StylesInput;
};

export function resolveStylesInput(styles?: StylesInput): Array<AnyStyledComposer> {
  if (!styles) return [];

  if (!Array.isArray(styles)) return [styles];

  return styles.map(resolveStylesInput).flat();
}

export type HtmlAttributesWithStyles<T> = PropsWithStyles<HTMLAttributes<T>>;
export type ComponentPropsWithStylesWithoutRef<T extends ElementType> = PropsWithStyles<ComponentPropsWithoutRef<T>>;

export function injectStyles(props: { $styles?: StylesInput }) {
  return resolveStylesInput(props.$styles);
}

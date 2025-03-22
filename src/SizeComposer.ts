import { Length } from "./utils";
import { StylesComposer } from "./StylesComposer";
import { isNotNullish } from "./utils/nullish";

type SizeOutputTarget =
  | "width"
  | "height"
  | "margin-x"
  | "margin-y"
  | "margin-top"
  | "margin-bottom"
  | "margin-left"
  | "margin-right"
  | "margin"
  | "padding-x"
  | "padding-y"
  | "padding-top"
  | "padding-bottom"
  | "padding-left"
  | "padding-right"
  | "padding"
  | "gap"
  | "min-width"
  | "min-height"
  | "max-width"
  | "max-height"
  | "transform-x"
  | "transform-y";

function resolveProperty(target: SizeOutputTarget) {
  if (target === "margin-x") {
    return ["margin-left", "margin-right"] as const;
  }

  if (target === "margin-y") {
    return ["margin-top", "margin-bottom"] as const;
  }

  if (target === "padding-x") {
    return ["padding-left", "padding-right"] as const;
  }

  if (target === "padding-y") {
    return ["padding-top", "padding-bottom"] as const;
  }

  if (target === "padding") {
    return ["padding-top", "padding-right", "padding-bottom", "padding-left"] as const;
  }

  if (target === "margin") {
    return ["margin-top", "margin-right", "margin-bottom", "margin-left"] as const;
  }

  return [target] as const;
}

interface StyledSizeConfig {
  targets: SizeOutputTarget[] | "inline";
  value: Length;
}

export function resolveMaybeBaseValue(value: Length) {
  if (typeof value === "number") {
    return `${value / 4}rem`;
  }

  return value;
}

export function resolveMaybeBaseValues(values: Length[]) {
  return values.map(resolveMaybeBaseValue);
}

export function resolveSizeValue(value: Length) {
  if (typeof value === "number") {
    return `${value}rem`;
  }

  return value;
}

export function resolveSizeValues(values: Length[]) {
  return values.map(resolveSizeValue);
}

function getSizeStyles(config: StyledSizeConfig) {
  const value = resolveSizeValue(config.value);

  const { targets } = config;

  if (targets === "inline") {
    return value;
  }

  const properties = targets.flatMap(resolveProperty);

  const styleLines = properties
    .map((property) => {
      if (property === "transform-x" || property === "transform-y") {
        return null;
      }

      return `${property}: ${value}`;
    })
    .filter(isNotNullish);

  const hasTransformX = targets.includes("transform-x");
  const hasTransformY = targets.includes("transform-y");

  if (hasTransformX || hasTransformY) {
    const transformParts: string[] = [];

    if (hasTransformX) {
      transformParts.push(`translateX(${value})`);
    }

    if (hasTransformY) {
      transformParts.push(`translateY(${value})`);
    }

    styleLines.push(`transform: ${transformParts.join(" ")}`);
  }

  return styleLines;
}

export class SizeComposer extends StylesComposer<StyledSizeConfig> {
  constructor(config: StyledSizeConfig) {
    super(config);
  }

  getStyles() {
    return getSizeStyles(this.config);
  }

  private setValue(value: Length) {
    return this.updateConfig({ value });
  }

  private addTarget(target: SizeOutputTarget) {
    if (this.config.targets === "inline") {
      return this.updateConfig({ targets: [target] });
    }

    return this.updateConfig({ targets: [...this.config.targets, target] });
  }

  base(value: number) {
    return this.setValue(`${value / 4}rem`);
  }

  rem(value: number) {
    return this.setValue(`${value}rem`);
  }

  level(level: number) {
    const multiplier = Math.pow(2, level);

    return this.base(multiplier);
  }

  px(value: number) {
    return this.setValue(`${value}px`);
  }

  em(value: number) {
    return this.setValue(`${value}em`);
  }

  get width() {
    return this.addTarget("width");
  }

  get height() {
    return this.addTarget("height");
  }

  get marginX() {
    return this.addTarget("margin-x");
  }

  get marginY() {
    return this.addTarget("margin-y");
  }

  get marginTop() {
    return this.addTarget("margin-top");
  }

  get marginBottom() {
    return this.addTarget("margin-bottom");
  }

  get marginLeft() {
    return this.addTarget("margin-left");
  }

  get marginRight() {
    return this.addTarget("margin-right");
  }

  get margin() {
    return this.addTarget("margin");
  }

  get paddingX() {
    return this.addTarget("padding-x");
  }

  get paddingY() {
    return this.addTarget("padding-y");
  }

  get paddingTop() {
    return this.addTarget("padding-top");
  }

  get paddingBottom() {
    return this.addTarget("padding-bottom");
  }

  get paddingLeft() {
    return this.addTarget("padding-left");
  }

  get paddingRight() {
    return this.addTarget("padding-right");
  }

  get padding() {
    return this.addTarget("padding");
  }

  get gap() {
    return this.addTarget("gap");
  }

  get size() {
    return this.addTarget("width").addTarget("height");
  }

  get minSize() {
    return this.addTarget("min-width").addTarget("min-height");
  }

  get maxSize() {
    return this.addTarget("max-width").addTarget("max-height");
  }

  get minWidth() {
    return this.addTarget("min-width");
  }

  get maxWidth() {
    return this.addTarget("max-width");
  }

  get minHeight() {
    return this.addTarget("min-height");
  }

  get maxHeight() {
    return this.addTarget("max-height");
  }

  get transformX() {
    return this.addTarget("transform-x");
  }

  get transformY() {
    return this.addTarget("transform-y");
  }
}

export const size = new SizeComposer({ value: 0, targets: "inline" });

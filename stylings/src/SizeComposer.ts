import { Composer, composer } from "./Composer";

import { ComposerConfig } from "./ComposerConfig";
import { Length } from "./utils";
import { convertToRem } from "./utils/convertUnits";

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

interface StyledSizeConfig {
  targets: SizeOutputTarget[] | "inline";
  value: Length;
}

const config = new ComposerConfig<StyledSizeConfig>({
  targets: "inline",
  value: 0,
});

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

export class SizeComposer extends Composer {
  private get resolvedSize() {
    return resolveSizeValue(this.getConfig(config).value);
  }

  private setValue(value: Length) {
    return this.updateConfig(config, { value });
  }

  base(value: number) {
    return this.setValue(convertToRem(value, "base") + "rem");
  }

  rem(value: number) {
    return this.setValue(`${value}rem`);
  }

  level(level: number) {
    return this.setValue(convertToRem(level, "level") + "rem");
  }

  px(value: number) {
    return this.setValue(`${value}px`);
  }

  em(value: number) {
    return this.setValue(`${value}em`);
  }

  get width() {
    return this.addStyle(`width: ${this.resolvedSize};`);
  }

  get height() {
    return this.addStyle(`height: ${this.resolvedSize};`);
  }

  get marginX() {
    return this.addStyle(`margin-left: ${this.resolvedSize}; margin-right: ${this.resolvedSize};`);
  }

  get marginY() {
    return this.addStyle(`margin-top: ${this.resolvedSize}; margin-bottom: ${this.resolvedSize};`);
  }

  get marginTop() {
    return this.addStyle(`margin-top: ${this.resolvedSize};`);
  }

  get marginBottom() {
    return this.addStyle(`margin-bottom: ${this.resolvedSize};`);
  }

  get marginLeft() {
    return this.addStyle(`margin-left: ${this.resolvedSize};`);
  }

  get marginRight() {
    return this.addStyle(`margin-right: ${this.resolvedSize};`);
  }

  get margin() {
    return this.addStyle([
      `margin-top: ${this.resolvedSize};`,
      `margin-right: ${this.resolvedSize};`,
      `margin-bottom: ${this.resolvedSize};`,
      `margin-left: ${this.resolvedSize};`,
    ]);
  }

  get paddingX() {
    return this.addStyle(`padding-left: ${this.resolvedSize}; padding-right: ${this.resolvedSize};`);
  }

  get paddingY() {
    return this.addStyle(`padding-top: ${this.resolvedSize}; padding-bottom: ${this.resolvedSize};`);
  }

  get paddingTop() {
    return this.addStyle(`padding-top: ${this.resolvedSize};`);
  }

  get paddingBottom() {
    return this.addStyle(`padding-bottom: ${this.resolvedSize};`);
  }

  get paddingLeft() {
    return this.addStyle(`padding-left: ${this.resolvedSize};`);
  }

  get paddingRight() {
    return this.addStyle(`padding-right: ${this.resolvedSize};`);
  }

  get padding() {
    return this.addStyle([
      `padding-top: ${this.resolvedSize};`,
      `padding-right: ${this.resolvedSize};`,
      `padding-bottom: ${this.resolvedSize};`,
      `padding-left: ${this.resolvedSize};`,
    ]);
  }

  get gap() {
    return this.addStyle(`gap: ${this.resolvedSize};`);
  }

  get size() {
    return this.width.height;
  }

  get minSize() {
    return this.minWidth.minHeight;
  }

  get maxSize() {
    return this.maxWidth.maxHeight;
  }

  get minWidth() {
    return this.addStyle(`min-width: ${this.resolvedSize};`);
  }

  get maxWidth() {
    return this.addStyle(`max-width: ${this.resolvedSize};`);
  }

  get minHeight() {
    return this.addStyle(`min-height: ${this.resolvedSize};`);
  }

  get maxHeight() {
    return this.addStyle(`max-height: ${this.resolvedSize};`);
  }

  get transformX() {
    return this.addStyle(`transform: translateX(${this.resolvedSize});`);
  }

  get transformY() {
    return this.addStyle(`transform: translateY(${this.resolvedSize});`);
  }

  get transformXY() {
    const resolvedSize = this.resolvedSize;

    return this.addStyle(`transform: translate(${resolvedSize}, ${resolvedSize});`);
  }
}

export const $size = composer(SizeComposer);

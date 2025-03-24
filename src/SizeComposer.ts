import { Composer } from "./Composer";
import { ComposerConfig } from "./ComposerConfig";
import { Length } from "./utils";
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

  private addTarget(target: SizeOutputTarget) {
    const currentConfig = this.getConfig(config);

    if (currentConfig.targets === "inline") {
      return this.updateConfig(config, { targets: [target] });
    }

    return this.updateConfig(config, { targets: [...currentConfig.targets, target] });
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
    return this.addStyle({ width: this.resolvedSize });
  }

  get height() {
    return this.addStyle({ height: this.resolvedSize });
  }

  get marginX() {
    return this.addStyle({ marginLeft: this.resolvedSize, marginRight: this.resolvedSize });
  }

  get marginY() {
    return this.addStyle({ marginTop: this.resolvedSize, marginBottom: this.resolvedSize });
  }

  get marginTop() {
    return this.addStyle({ marginTop: this.resolvedSize });
  }

  get marginBottom() {
    return this.addStyle({ marginBottom: this.resolvedSize });
  }

  get marginLeft() {
    return this.addStyle({ marginLeft: this.resolvedSize });
  }

  get marginRight() {
    return this.addStyle({ marginRight: this.resolvedSize });
  }

  get margin() {
    return this.addStyle({
      marginTop: this.resolvedSize,
      marginRight: this.resolvedSize,
      marginBottom: this.resolvedSize,
      marginLeft: this.resolvedSize,
    });
  }

  get paddingX() {
    return this.addStyle({ paddingLeft: this.resolvedSize, paddingRight: this.resolvedSize });
  }

  get paddingY() {
    return this.addStyle({ paddingTop: this.resolvedSize, paddingBottom: this.resolvedSize });
  }

  get paddingTop() {
    return this.addStyle({ paddingTop: this.resolvedSize });
  }

  get paddingBottom() {
    return this.addStyle({ paddingBottom: this.resolvedSize });
  }

  get paddingLeft() {
    return this.addStyle({ paddingLeft: this.resolvedSize });
  }

  get paddingRight() {
    return this.addStyle({ paddingRight: this.resolvedSize });
  }

  get padding() {
    return this.addStyle({
      paddingTop: this.resolvedSize,
      paddingRight: this.resolvedSize,
      paddingBottom: this.resolvedSize,
      paddingLeft: this.resolvedSize,
    });
  }

  get gap() {
    return this.addStyle({ gap: this.resolvedSize });
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
    return this.addStyle({ minWidth: this.resolvedSize });
  }

  get maxWidth() {
    return this.addStyle({ maxWidth: this.resolvedSize });
  }

  get minHeight() {
    return this.addStyle({ minHeight: this.resolvedSize });
  }

  get maxHeight() {
    return this.addStyle({ maxHeight: this.resolvedSize });
  }

  get transformX() {
    return this.addTarget("transform-x");
  }

  get transformY() {
    return this.addTarget("transform-y");
  }
}

export const size = new SizeComposer().init();

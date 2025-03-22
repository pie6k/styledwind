import { blendColors, getColorBorderColor, getHighlightedColor, isColorDark, setColorOpacity } from "./utils/color";

import { StylesComposer } from "./StylesComposer";
import { isDefined } from "./utils";

interface ColorsInput {
  color: string;
  foreground?: string;
  hoverMultiplier?: number;
  border?: string;
  hover?: string;
  active?: string;
}

export interface ColorConfig extends ColorsInput {
  outputType?: "inline" | "background" | "color" | "border" | "outline" | "fill";
  isBackgroundWithBorder?: boolean;
  interactive?: boolean;
}

const hovers = [":hover", ".hover"];
const svgActives = [":active", ".active"];
const actives = [...svgActives, ":not(button):not(div):focus"];

const HOVER_SELECTOR = hovers.map((hover) => `&${hover}`).join(", ");
const ACTIVE_SELECTOR = actives.map((active) => `&${active}`).join(", ");

function getColorForeground(config: ColorConfig) {
  if (isColorDark(config.color)) {
    return "#ffffff";
  }

  return "#000000";
}

function getColorHoverColor(config: ColorConfig) {
  const hoverMultiplier = config.hoverMultiplier ?? 1;
  if (isDefined(config.hover)) {
    return config.hover;
  }

  return blendColors(config.color, config.foreground ?? getColorForeground(config), 0.125 * hoverMultiplier);
}

function getColorActiveColor(config: ColorConfig) {
  const hoverMultiplier = config.hoverMultiplier ?? 1;

  if (isDefined(config.active)) {
    return config.active;
  }

  return blendColors(config.color, config.foreground ?? getColorForeground(config), 0.175 * hoverMultiplier);
}

function getColorStyles(config: ColorConfig) {
  if (!isDefined(config.outputType) || config.outputType === "inline") {
    return config.color;
  }

  const styles: string[] = [];

  switch (config.outputType) {
    case "background":
      styles.push(`background-color: ${config.color}; --background-color: ${config.color};`);
      if (config.foreground) {
        styles.push(`color: ${config.foreground}; --color: ${config.foreground};`);
      }
      break;
    case "color":
      styles.push(`color: ${config.color}; --color: ${config.color};`);
      break;
    case "border":
      styles.push(`border-color: ${config.color}; --border-color: ${config.color};`);
      break;
    case "outline":
      styles.push(`outline-color: ${config.color}; --outline-color: ${config.color};`);
      break;
    case "fill":
      styles.push(`fill: ${config.color}; --fill-color: ${config.color};`);
      if (config.foreground) {
        styles.push(`color: ${config.foreground}; --color: ${config.foreground};`);
      }
      break;
  }

  if (config.isBackgroundWithBorder) {
    styles.push(
      `border: 1px solid ${getColorBorderColor(config.color)}; --border-color: ${getColorBorderColor(config.color)};`,
    );
  }

  if (!config.interactive) {
    return styles.join(";");
  }

  styles.push(
    `${HOVER_SELECTOR} { ${getColorStyles({
      ...config,
      color: getColorHoverColor(config),
      interactive: false,
    })} }`,
  );

  styles.push(
    `${ACTIVE_SELECTOR} { ${getColorStyles({
      ...config,
      color: getColorActiveColor(config),
      interactive: false,
    })} }`,
  );

  return styles;
}

export class ColorComposer extends StylesComposer<ColorConfig> {
  constructor(config: ColorConfig) {
    super(config);
  }

  color(value: string) {
    return this.updateConfig({ color: value });
  }

  opacity(value: number) {
    return this.updateConfig({ color: setColorOpacity(this.config.color, value) });
  }

  get secondary() {
    return this.opacity(0.55);
  }

  get tertiary() {
    return this.opacity(0.3);
  }

  get transparent() {
    return this.opacity(0);
  }

  outputType(value: ColorConfig["outputType"]) {
    return this.updateConfig({ outputType: value });
  }

  get asBg() {
    return this.outputType("background");
  }

  get asColor() {
    return this.outputType("color");
  }

  get asBorder() {
    return this.outputType("border");
  }

  get asOutline() {
    return this.outputType("outline");
  }

  get asFill() {
    return this.outputType("fill");
  }

  get withBorder() {
    return this.updateConfig({ isBackgroundWithBorder: true });
  }

  get interactive() {
    return this.updateConfig({ interactive: true });
  }

  private changeColor(value: string) {
    return this.updateConfig({ color: value, border: this.config.border, foreground: this.config.foreground });
  }

  get hover() {
    return this.changeColor(getHighlightedColor(this.config.color));
  }

  get active() {
    return this.changeColor(getHighlightedColor(this.config.color, 2));
  }

  get muted() {
    return this.changeColor(getHighlightedColor(this.config.color, 0.33));
  }

  highlight(ratio: number = 1) {
    return this.changeColor(getHighlightedColor(this.config.color, ratio));
  }

  get foreground() {
    return this.updateConfig({ color: getColorForeground(this.config) });
  }

  getStyles() {
    return getColorStyles(this.config);
  }
}

export function colorComposer(color: ColorsInput) {
  return new ColorComposer(color).start();
}

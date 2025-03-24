import { blendColors, getColorBorderColor, getHighlightedColor, isColorDark, setColorOpacity } from "./utils/color";

import { Composer } from "./Composer";
import { ComposerConfig } from "./ComposerConfig";
import { isDefined } from "./utils";
import { memoizeFn } from "./utils/memoize";

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

const config = new ComposerConfig<ColorConfig>({
  color: "#000000",
});

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

export class ColorComposer extends Composer {
  define(value: ColorsInput) {
    return this.updateConfig(config, value);
  }

  color(value: string) {
    return this.updateConfig(config, { color: value });
  }

  opacity(value: number) {
    const currentConfig = this.getConfig(config);

    return this.updateConfig(config, { color: setColorOpacity(currentConfig.color, value) });
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
    return this.updateConfig(config, { outputType: value });
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
    return this.updateConfig(config, { isBackgroundWithBorder: true });
  }

  get interactive() {
    return this.updateConfig(config, { interactive: true });
  }

  private changeColor(value: string) {
    const currentConfig = this.getConfig(config);

    return this.updateConfig(config, {
      color: value,
      border: currentConfig.border,
      foreground: currentConfig.foreground,
    });
  }

  get hover() {
    const currentConfig = this.getConfig(config);

    return this.changeColor(getHighlightedColor(currentConfig.color));
  }

  get active() {
    const currentConfig = this.getConfig(config);

    return this.changeColor(getHighlightedColor(currentConfig.color, 2));
  }

  get muted() {
    const currentConfig = this.getConfig(config);

    return this.changeColor(getHighlightedColor(currentConfig.color, 0.33));
  }

  highlight(ratio: number = 1) {
    const currentConfig = this.getConfig(config);

    return this.changeColor(getHighlightedColor(currentConfig.color, ratio));
  }

  get foreground() {
    const currentConfig = this.getConfig(config);

    return this.updateConfig(config, { color: getColorForeground(currentConfig) });
  }

  compile() {
    const currentConfig = this.getConfig(config);

    return [super.compile(), getColorStyles(currentConfig)];
  }
}

export const color = memoizeFn(
  function color(color: ColorsInput) {
    return new ColorComposer().define(color);
  },
  { mode: "equal" },
);

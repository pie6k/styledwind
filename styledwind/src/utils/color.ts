import Color from "color";
import { memoizeFn } from "./memoize";

const HOVER_COLOR_CHANGE = 15;

function getColorLightnessVariant(color: string, ratio = 1): string {
  if (isColorDark(color)) {
    return changeColorLightness(color, ratio);
  }

  return changeColorLightness(color, -ratio);
}

export function getHighlightedColor(color: string, ratio = 1): string {
  return getColorLightnessVariant(color, HOVER_COLOR_CHANGE * ratio);
}

export function getColorForeground(color: string) {
  if (isColorDark(color)) {
    return "hsl(0, 0%, 100%)";
  }

  return "hsl(0, 0%, 0%)";
}

export function getColorBorderColor(color: string) {
  return getHighlightedColor(color, 0.75);
}

export const setColorOpacity = memoizeFn(function setColorOpacity(color: string, opacity: number): string {
  const colorInstance = new Color(color);
  return colorInstance
    .hsl()
    .fade(1 - opacity)
    .hsl()
    .toString();
});

export const isColorDark = memoizeFn(function isColorDark(color: string): boolean {
  const colorInstance = new Color(color);
  return colorInstance.isDark();
});

export const changeColorLightness = memoizeFn(function changeColorLightness(color: string, offset: number): string {
  const colorInstance = new Color(color);
  const currentLightness = colorInstance.lightness();

  return colorInstance
    .lightness(currentLightness + offset)
    .hsl()
    .toString();
});

export const blendColors = memoizeFn(function blendColors(color: string, foreground: string, ratio: number): string {
  const colorInstance = new Color(color);
  const foregroundInstance = new Color(foreground);

  return colorInstance.mix(foregroundInstance, ratio).rgb().toString();
});

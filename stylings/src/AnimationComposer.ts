import type { Property, StandardPropertiesHyphen } from "csstype";
import { css, keyframes } from "styled-components";
import { resolveMaybeBaseValue, resolveMaybeBaseValues } from "./SizeComposer";
import { type Length, addUnit, isInteger } from "./utils";

import { simplifyRule } from "./compilation";
import { Composer, composer } from "./Composer";
import { ComposerConfig } from "./ComposerConfig";
import { getHasValue } from "./utils/maybeValue";

type PropertyAnimationSteps<V> = Array<V>;

type AnimatedTransformProperties = {
  "transform-x": Length;
  "transform-y": Length;
  "transform-scale": Length;
  "transform-rotate": Length;
};

type FilterTransformProperties = {
  "filter-blur": Length;
  "filter-brightness": Length;
  "filter-contrast": Length;
  "filter-drop-shadow": Length;
  "filter-grayscale": Length;
  "filter-hue-rotate": Length;
  "filter-invert": Length;
  "filter-opacity": Length;
  "filter-saturate": Length;
  "filter-sepia": Length;
};

type BackdropFilterTransformProperties = {
  "backdrop-blur": Length;
  "backdrop-brightness": Length;
  "backdrop-contrast": Length;
  "backdrop-drop-shadow": Length;
  "backdrop-grayscale": Length;
  "backdrop-hue-rotate": Length;
  "backdrop-invert": Length;
  "backdrop-opacity": Length;
  "backdrop-saturate": Length;
  "backdrop-sepia": Length;
};

interface AnimatableProperties
  extends AnimatedTransformProperties,
    FilterTransformProperties,
    BackdropFilterTransformProperties,
    StandardPropertiesHyphen {}

type PropertiesSteps = {
  [key in keyof AnimatableProperties]?: PropertyAnimationSteps<AnimatableProperties[key]>;
};

export function getHasAnimationProperty(property: keyof AnimatableProperties, properties: PropertiesSteps) {
  return properties[property] !== undefined;
}

interface StyledAnimationConfig {
  duration: Length;
  easing: Property.AnimationTimingFunction;
  properties?: PropertiesSteps;
}

function getKeyframePercentageLabel(value: number) {
  const percent = value * 100;

  if (isInteger(percent)) return `${percent}%`;

  return `${percent.toFixed(2)}%`;
}

function preaparePercentageVariableLabel(progress: number) {
  return getKeyframePercentageLabel(progress).replace(".", "_").replace("%", "");
}

function getAnimationStepVariableName(property: keyof AnimatableProperties, progress: number) {
  const progressLabel = preaparePercentageVariableLabel(progress);
  const finalProperty = property.replace("transform-", "");
  return `--animate_${finalProperty}_${progressLabel}`;
}

function getWillChangeProperties(properties: PropertiesSteps) {
  const willChangeProperties = new Set<Property.WillChange>();

  const keys = Object.keys(properties);

  if (keys.some((k) => k.startsWith("transform"))) {
    willChangeProperties.add("transform");
  }

  if (keys.some((k) => k.startsWith("filter"))) {
    willChangeProperties.add("filter");
  }

  if (keys.some((k) => k.startsWith("backdrop"))) {
    willChangeProperties.add("backdrop-filter");
  }

  if (keys.some((k) => k.startsWith("opacity"))) {
    willChangeProperties.add("opacity");
  }

  if (keys.some((k) => k.startsWith("color"))) {
    willChangeProperties.add("color");
  }

  if (keys.some((k) => k.startsWith("background"))) {
    willChangeProperties.add("background");
  }

  if (!willChangeProperties.size) return null;

  return Array.from(willChangeProperties);
}

function getPropertyAnimationVariables<T extends keyof AnimatableProperties>(
  property: T,
  steps: PropertyAnimationSteps<AnimatableProperties[T]>,
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [index, step] of steps.entries()) {
    const progress = index / (steps.length - 1);
    const variableName = getAnimationStepVariableName(property, progress);

    result[variableName] = `${step}`;
  }

  return result;
}

function mergeRecords(records: Record<string, string>[]) {
  return records.reduce((acc, record) => {
    return { ...acc, ...record };
  }, {});
}

function getPropertiesAnimationVariables(properties: PropertiesSteps): Record<string, string> {
  const variablesPerProperty = Object.entries(properties)
    .filter(([property]) => getDoesNeedVariables(property as keyof AnimatableProperties))
    .map(([property, steps]) => {
      return getPropertyAnimationVariables(property as keyof AnimatableProperties, steps);
    });

  return mergeRecords(variablesPerProperty);
}

function getIsTransformProperty(property: keyof AnimatableProperties) {
  return ["transform-x", "transform-y", "transform-scale", "transform-rotate"].includes(property);
}

function getIsFilterProperty(property: keyof AnimatableProperties) {
  return [
    "filter-blur",
    "filter-brightness",
    "filter-contrast",
    "filter-drop-shadow",
    "filter-grayscale",
    "filter-hue-rotate",
    "filter-invert",
    "filter-opacity",
    "filter-saturate",
    "filter-sepia",
  ].includes(property);
}

function getIsBackdropFilterProperty(property: keyof AnimatableProperties) {
  return [
    "backdrop-blur",
    "backdrop-brightness",
    "backdrop-contrast",
    "backdrop-drop-shadow",
    "backdrop-grayscale",
    "backdrop-hue-rotate",
    "backdrop-invert",
    "backdrop-opacity",
    "backdrop-saturate",
    "backdrop-sepia",
  ].includes(property);
}

function getTransformAnimationStyleString(progress: number, properties: PropertiesSteps) {
  const xVar = getAnimationStepVariableName("transform-x", progress);
  const yVar = getAnimationStepVariableName("transform-y", progress);
  const scaleVar = getAnimationStepVariableName("transform-scale", progress);
  const rotateVar = getAnimationStepVariableName("transform-rotate", progress);

  const transforms: string[] = [];

  if (getHasAnimationProperty("transform-x", properties) || getHasAnimationProperty("transform-y", properties)) {
    transforms.push(`translate(var(${xVar}, 0), var(${yVar}, 0))`);
  }

  if (getHasAnimationProperty("transform-scale", properties)) {
    transforms.push(`scale(var(${scaleVar}, 1))`);
  }

  if (getHasAnimationProperty("transform-rotate", properties)) {
    transforms.push(`rotate(var(${rotateVar}, 0))`);
  }

  return `
    transform: ${transforms.join(" ")};
  `;
}

function getFilterAnimationStyleString(progress: number, properties: PropertiesSteps) {
  const blurVar = getAnimationStepVariableName("filter-blur", progress);
  const brightnessVar = getAnimationStepVariableName("filter-brightness", progress);
  const contrastVar = getAnimationStepVariableName("filter-contrast", progress);
  const dropShadowVar = getAnimationStepVariableName("filter-drop-shadow", progress);
  const grayscaleVar = getAnimationStepVariableName("filter-grayscale", progress);
  const hueRotateVar = getAnimationStepVariableName("filter-hue-rotate", progress);
  const invertVar = getAnimationStepVariableName("filter-invert", progress);
  const opacityVar = getAnimationStepVariableName("filter-opacity", progress);
  const saturateVar = getAnimationStepVariableName("filter-saturate", progress);
  const sepiaVar = getAnimationStepVariableName("filter-sepia", progress);

  const filters: string[] = [];

  if (getHasAnimationProperty("filter-blur", properties)) {
    filters.push(`blur(var(${blurVar}, 0))`);
  }

  if (getHasAnimationProperty("filter-brightness", properties)) {
    filters.push(`brightness(var(${brightnessVar}, 1))`);
  }

  if (getHasAnimationProperty("filter-contrast", properties)) {
    filters.push(`contrast(var(${contrastVar}, 1))`);
  }

  if (getHasAnimationProperty("filter-drop-shadow", properties)) {
    filters.push(`drop-shadow(var(${dropShadowVar}, 0))`);
  }

  if (getHasAnimationProperty("filter-grayscale", properties)) {
    filters.push(`grayscale(var(${grayscaleVar}, 0))`);
  }

  if (getHasAnimationProperty("filter-hue-rotate", properties)) {
    filters.push(`hue-rotate(var(${hueRotateVar}, 0))`);
  }

  if (getHasAnimationProperty("filter-invert", properties)) {
    filters.push(`invert(var(${invertVar}, 0))`);
  }

  if (getHasAnimationProperty("filter-opacity", properties)) {
    filters.push(`opacity(var(${opacityVar}, 1))`);
  }

  if (getHasAnimationProperty("filter-saturate", properties)) {
    filters.push(`saturate(var(${saturateVar}, 1))`);
  }

  if (getHasAnimationProperty("filter-sepia", properties)) {
    filters.push(`sepia(var(${sepiaVar}, 0))`);
  }

  return `
    filter: ${filters.join(" ")};
  `;
}

function getBackdropFilterAnimationStyleString(progress: number, properties: PropertiesSteps) {
  const blurVar = getAnimationStepVariableName("backdrop-blur", progress);
  const brightnessVar = getAnimationStepVariableName("backdrop-brightness", progress);
  const contrastVar = getAnimationStepVariableName("backdrop-contrast", progress);
  const dropShadowVar = getAnimationStepVariableName("backdrop-drop-shadow", progress);
  const grayscaleVar = getAnimationStepVariableName("backdrop-grayscale", progress);
  const hueRotateVar = getAnimationStepVariableName("backdrop-hue-rotate", progress);
  const invertVar = getAnimationStepVariableName("backdrop-invert", progress);
  const opacityVar = getAnimationStepVariableName("backdrop-opacity", progress);
  const saturateVar = getAnimationStepVariableName("backdrop-saturate", progress);
  const sepiaVar = getAnimationStepVariableName("backdrop-sepia", progress);

  const filters: string[] = [];

  if (getHasAnimationProperty("backdrop-blur", properties)) {
    filters.push(`blur(var(${blurVar}, 0))`);
  }

  if (getHasAnimationProperty("backdrop-brightness", properties)) {
    filters.push(`brightness(var(${brightnessVar}, 1))`);
  }

  if (getHasAnimationProperty("backdrop-contrast", properties)) {
    filters.push(`contrast(var(${contrastVar}, 1))`);
  }

  if (getHasAnimationProperty("backdrop-drop-shadow", properties)) {
    filters.push(`drop-shadow(var(${dropShadowVar}, 0))`);
  }

  if (getHasAnimationProperty("backdrop-grayscale", properties)) {
    filters.push(`grayscale(var(${grayscaleVar}, 0))`);
  }

  if (getHasAnimationProperty("backdrop-hue-rotate", properties)) {
    filters.push(`hue-rotate(var(${hueRotateVar}, 0))`);
  }

  if (getHasAnimationProperty("backdrop-invert", properties)) {
    filters.push(`invert(var(${invertVar}, 0))`);
  }

  if (getHasAnimationProperty("backdrop-opacity", properties)) {
    filters.push(`opacity(var(${opacityVar}, 1))`);
  }

  if (getHasAnimationProperty("backdrop-saturate", properties)) {
    filters.push(`saturate(var(${saturateVar}, 1))`);
  }

  if (getHasAnimationProperty("backdrop-sepia", properties)) {
    filters.push(`sepia(var(${sepiaVar}, 0))`);
  }

  return `backdrop-filter: ${filters.join(" ")};`;
}

function getDoesNeedVariables(property: keyof AnimatableProperties) {
  return getIsTransformProperty(property) || getIsFilterProperty(property) || getIsBackdropFilterProperty(property);
}

function getAnimationPropertyStyleString<T extends keyof AnimatableProperties>(
  property: T,
  value: AnimatableProperties[T],
  progress: number,
  properties: PropertiesSteps,
) {
  if (getIsTransformProperty(property)) return getTransformAnimationStyleString(progress, properties);
  if (getIsFilterProperty(property)) return getFilterAnimationStyleString(progress, properties);
  if (getIsBackdropFilterProperty(property)) return getBackdropFilterAnimationStyleString(progress, properties);

  return `${property}: ${value};`;
}

function getAnimationPropertyKeyframes<T extends keyof AnimatableProperties>(
  property: T,
  steps: PropertyAnimationSteps<AnimatableProperties[T]>,
  properties: PropertiesSteps,
) {
  return steps.map((step, index) => {
    const progress = index / (steps.length - 1);
    const percentage = getKeyframePercentageLabel(progress);

    return {
      percentageLabel: percentage,
      style: getAnimationPropertyStyleString(property, step, progress, properties),
    };
  });
}

function getAnimationKeyframesString(properties: PropertiesSteps) {
  const keyframes = Object.entries(properties)
    .map(([property, steps]) => {
      return getAnimationPropertyKeyframes(property as keyof AnimatableProperties, steps, properties);
    })
    .flat();

  const keyframesMap = new Map<string, Set<string>>();

  for (const keyframe of keyframes) {
    let styles = keyframesMap.get(keyframe.percentageLabel);

    if (!styles) {
      styles = new Set();
    }

    styles.add(keyframe.style);
    keyframesMap.set(keyframe.percentageLabel, styles);
  }

  return Array.from(keyframesMap.entries()).map(([percentage, styles]) => {
    return `${percentage} { ${Array.from(styles).join("")} } `;
  });
}

const config = new ComposerConfig<StyledAnimationConfig>({
  duration: "150ms",
  easing: "ease-in-out",
});

export class AnimationComposer extends Composer {
  property<P extends keyof AnimatableProperties>(property: P, steps: PropertyAnimationSteps<AnimatableProperties[P]>) {
    const currentProperties = this.getConfig(config).properties ?? {};

    return this.updateConfig(config, { properties: { ...currentProperties, [property]: steps } });
  }

  duration(duration: Length) {
    return this.updateConfig(config, { duration: addUnit(duration, "ms") });
  }

  delay(delay: Length) {
    return this.addStyle({ animationDelay: addUnit(delay, "ms") });
  }

  get fadeIn() {
    return this.property("opacity", [0, 1]);
  }

  get fadeOut() {
    return this.property("opacity", [1, 0]);
  }

  slideUpFromBottom(by: Length) {
    return this.property("transform-y", [resolveMaybeBaseValue(by), "0"]);
  }

  slideDownFromTop(by: Length) {
    return this.property("transform-y", [`-${resolveMaybeBaseValue(by)}`, "0"]);
  }

  zoomIn(scale: number) {
    return this.property("transform-scale", [scale, 1]);
  }

  zoomOut(scale: number) {
    return this.property("transform-scale", [1, scale]);
  }

  easing(easing: Property.AnimationTimingFunction) {
    return this.updateConfig(config, { easing });
  }

  slideLeftFromRight(by: Length) {
    return this.property("transform-x", [`-${resolveMaybeBaseValue(by)}`, "0"]);
  }

  slideRightFromLeft(by: Length) {
    return this.property("transform-x", [resolveMaybeBaseValue(by), "0"]);
  }

  fillMode(mode: Property.AnimationFillMode) {
    return this.addStyle({ animationFillMode: mode });
  }

  iterationCount(count: Property.AnimationIterationCount) {
    return this.addStyle({ animationIterationCount: count });
  }

  rotate(angles: Length[]) {
    return this.property("transform-rotate", angles);
  }

  x(steps: Length[]) {
    return this.property("transform-x", resolveMaybeBaseValues(steps));
  }

  y(steps: Length[]) {
    return this.property("transform-y", resolveMaybeBaseValues(steps));
  }

  scale(steps: number[]) {
    return this.property("transform-scale", steps);
  }

  blur(steps: Length[]) {
    return this.property(
      "filter-blur",
      steps.map((s) => addUnit(s, "px")),
    );
  }

  opacity(steps: Length[]) {
    return this.property("opacity", steps);
  }

  get infinite() {
    return this.addStyle({ animationIterationCount: "infinite" });
  }

  get spin() {
    return this.rotate(["0deg", "360deg"]).infinite.easing("linear").duration("2s");
  }

  get transformStyle() {
    return "";
  }

  compile() {
    if (getHasValue(this.compileCache)) return this.compileCache;

    const currentConfig = this.getConfig(config);

    if (!currentConfig.properties) return super.compile();

    const variables = getPropertiesAnimationVariables(currentConfig.properties);
    const keyframesString = getAnimationKeyframesString(currentConfig.properties);

    // prettier-ignore
    const animation = keyframes`${keyframesString}`;

    const willChangeProperties = getWillChangeProperties(currentConfig.properties);

    const rule = simplifyRule(css`
      animation-name: ${animation};

      ${{
        animationDuration: addUnit(currentConfig.duration, "ms"),
        animationTimingFunction: currentConfig.easing,
        willChange: willChangeProperties?.join(", ") ?? undefined,
        ...variables,
      }}
    `);

    return super.compile(rule);
  }
}

export const $animation = composer(AnimationComposer);

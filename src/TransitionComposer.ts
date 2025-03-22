import { DEFAULT_TRANSITION_DURATION_MS, DEFAULT_TRANSITION_EASING } from "./config";
import { Length, addUnit, multiplyUnit } from "./utils";

import type { CSSProperty } from "./types";
import { StylesComposer } from "./StylesComposer";

interface StyledTransitionConfig {
  easing?: string;
  duration?: Length;
  properties?: CSSProperty[] | "all";
  slowRelease?: boolean;
}

function getTransitionStyles({
  easing = DEFAULT_TRANSITION_EASING,
  duration = DEFAULT_TRANSITION_DURATION_MS,
  properties = ["all"],
  slowRelease = false,
}: StyledTransitionConfig) {
  const propertiesString = properties === "all" ? "all" : properties.join(", ");

  const styles = [
    `transition-property: ${propertiesString};`,
    `transition-timing-function: ${easing};`,
    `transition-duration: ${multiplyUnit(duration, 3, "ms")};`,
  ];

  if (slowRelease) {
    styles.push(`
      &:hover {
        transition-duration: ${addUnit(duration, "ms")};
      }
    `);
  }

  return styles;
}

export class TransitionComposer extends StylesComposer<StyledTransitionConfig> {
  constructor(props: StyledTransitionConfig) {
    super(props);
  }

  easing(easing: string) {
    return this.updateConfig({ easing });
  }

  duration(duration: Length) {
    return this.updateConfig({ duration });
  }

  get slowRelease() {
    return this.updateConfig({ slowRelease: true });
  }

  get all() {
    return this.updateConfig({ properties: "all" });
  }

  get colors() {
    return this.property("color", "background-color", "border-color", "text-decoration-color", "fill", "stroke");
  }

  get common() {
    return this.property(
      "color",
      "background-color",
      "border-color",
      "text-decoration-color",
      "fill",
      "stroke",
      "opacity",
      "box-shadow",
      "transform",
      "filter",
      "backdrop-filter",
    );
  }

  property(...properties: CSSProperty[]) {
    return this.updateConfig({ properties });
  }

  getStyles() {
    return getTransitionStyles(this.config);
  }
}

export const transition = new TransitionComposer({}).start();

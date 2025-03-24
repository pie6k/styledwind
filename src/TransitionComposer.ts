import { DEFAULT_TRANSITION_DURATION_MS, DEFAULT_TRANSITION_EASING } from "./defaults";
import { Length, addUnit, multiplyUnit } from "./utils";

import type { CSSProperty } from "./types";
import { Composer } from "./Composer";
import { ComposerConfig } from "./ComposerConfig";
import { Property } from "csstype";

interface StyledTransitionConfig {
  easing: string;
  duration: Length;
  properties: CSSProperty[] | "all";
  slowRelease: boolean;
}

const config = new ComposerConfig<StyledTransitionConfig>({
  easing: DEFAULT_TRANSITION_EASING,
  duration: DEFAULT_TRANSITION_DURATION_MS,
  properties: ["all"],
  slowRelease: false,
});

export class TransitionComposer extends Composer {
  easing(easing: Property.TransitionTimingFunction) {
    return this.updateConfig(config, { easing });
  }

  duration(duration: Length) {
    return this.updateConfig(config, { duration });
  }

  get slowRelease() {
    return this.updateConfig(config, { slowRelease: true });
  }

  get all() {
    return this.property("all");
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
    return this.updateConfig(config, { properties });
  }

  compile() {
    const { easing, duration, properties, slowRelease } = this.getConfig(config);
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
}

export const transition = new TransitionComposer().init();

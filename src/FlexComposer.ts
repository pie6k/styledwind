import type { Property } from "csstype";
import { SpacingBoxConfig } from "./BoxComposer";
import { StylesComposer } from "./StylesComposer";
import { getIsDefined } from "./utils";
import { size } from "./SizeComposer";

interface FlexBoxConfig extends SpacingBoxConfig {
  direction?: Property.FlexDirection;
  gapLevel?: number;
  alignItems?: Property.AlignItems;
  justifyContent?: Property.JustifyContent;
  isReverse?: boolean;
  isWrap?: boolean;
  isInline?: boolean;
}

function getFlexBoxStyles(config: FlexBoxConfig) {
  const styles: string[] = [];

  if (config.isInline) {
    styles.push(`display: inline-flex;`);
  } else {
    styles.push(`display: flex;`);
  }

  if (getIsDefined(config.gapLevel)) {
    styles.push(size.level(config.gapLevel).gap.toString() + ";");
  }

  if (getIsDefined(config.alignItems)) {
    styles.push(`align-items: ${config.alignItems};`);
  }

  if (getIsDefined(config.justifyContent)) {
    styles.push(`justify-content: ${config.justifyContent};`);
  }

  if (config.isWrap) {
    styles.push(`flex-wrap: wrap;`);
  }

  if (getIsDefined(config.isReverse) || getIsDefined(config.direction)) {
    if (config.isReverse) {
      styles.push(`flex-direction: ${config.direction}-reverse;`);
    } else if (config.direction === "column") {
      styles.push(`flex-direction: column;`);
    }
  }

  return styles;
}

export class FlexComposer<Config extends FlexBoxConfig> extends StylesComposer<Config> {
  constructor(config?: Config) {
    super(config ?? ({} as Config));
  }

  get horizontal() {
    return this.updateConfig({ direction: "row" } as Partial<Config>);
  }

  get vertical() {
    return this.updateConfig({ direction: "column" } as Partial<Config>);
  }

  get x() {
    return this.horizontal;
  }

  get y() {
    return this.vertical;
  }

  gap(value: number = 1) {
    return this.updateConfig({ gapLevel: value } as Partial<Config>);
  }

  align(value: FlexBoxConfig["alignItems"]) {
    return this.updateConfig({ alignItems: value } as Partial<Config>);
  }

  get alignCenter() {
    return this.align("center");
  }

  get alignStart() {
    return this.align("flex-start");
  }

  get alignEnd() {
    return this.align("flex-end");
  }

  get alignStretch() {
    return this.align("stretch");
  }

  get alignBaseline() {
    return this.align("baseline");
  }

  justify(value: FlexBoxConfig["justifyContent"]) {
    return this.updateConfig({ justifyContent: value } as Partial<Config>);
  }

  get justifyCenter() {
    return this.justify("center");
  }

  get justifyStart() {
    return this.justify("flex-start");
  }

  get justifyEnd() {
    return this.justify("flex-end");
  }

  get justifyBetween() {
    return this.justify("space-between");
  }

  get justifyAround() {
    return this.justify("space-around");
  }

  get justifyEvenly() {
    return this.justify("space-evenly");
  }

  get center() {
    return this.alignCenter.justifyCenter;
  }

  get reverse() {
    return this.updateConfig({ isReverse: true } as Partial<Config>);
  }

  get wrap() {
    return this.updateConfig({ isWrap: true } as Partial<Config>);
  }

  get inline() {
    return this.updateConfig({ isInline: true } as Partial<Config>);
  }

  getStyles() {
    return getFlexBoxStyles(this.config);
  }
}

export const flex = new FlexComposer().start();

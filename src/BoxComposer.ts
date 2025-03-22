import { FlexComposer } from "./FlexComposer";
import { getIsDefined } from "./utils";
import { resolveSizeValue } from "./SizeComposer";

interface SizingBoxInput {
  px?: number;
  py?: number;
  radius?: number;
  height?: number;
  width?: number;
}

export interface SpacingBoxConfig {
  input?: SizingBoxInput;
  usePaddingX?: boolean;
  usePaddingY?: boolean;
  useRadius?: boolean;
  useHeight?: boolean;
  useWidth?: boolean;
  noPT?: boolean;
  noPB?: boolean;
  noPL?: boolean;
  noPR?: boolean;
}

function getSpacingBoxStyles(config: SpacingBoxConfig) {
  const styles: string[] = [];

  const { px, py, radius, height, width } = config.input ?? {};

  if (getIsDefined(config.usePaddingX) && getIsDefined(px)) {
    styles.push(`padding-left: ${resolveSizeValue(px)}; padding-right: ${resolveSizeValue(px)};`);
  }

  if (getIsDefined(config.usePaddingY) && getIsDefined(py)) {
    styles.push(`padding-top: ${resolveSizeValue(py)}; padding-bottom: ${resolveSizeValue(py)};`);
  }

  if (getIsDefined(config.useRadius) && getIsDefined(radius)) {
    styles.push(`border-radius: ${resolveSizeValue(radius)};`);
  }

  if (getIsDefined(config.useHeight) && getIsDefined(height)) {
    styles.push(`height: ${resolveSizeValue(height)};`);
  }

  if (getIsDefined(config.useWidth) && getIsDefined(width)) {
    styles.push(`width: ${resolveSizeValue(width)};`);
  }

  if (config.noPT) {
    styles.push(`padding-top: 0;`);
  }

  if (config.noPB) {
    styles.push(`padding-bottom: 0;`);
  }

  if (config.noPL) {
    styles.push(`padding-left: 0;`);
  }

  if (config.noPR) {
    styles.push(`padding-right: 0;`);
  }

  return styles;
}

export class BoxComposer<Config extends SpacingBoxConfig> extends FlexComposer<Config> {
  constructor(config?: Config) {
    super(config ?? ({} as Config));
  }

  getStyles() {
    const flexStyles = super.getStyles();

    flexStyles.push(...getSpacingBoxStyles(this.config));

    return flexStyles;
  }

  configure(value: SizingBoxInput) {
    return this.updateConfig({
      input: {
        ...this.config.input,
        ...value,
      },
    } as Partial<Config>);
  }

  get padding() {
    return this.updateConfig({ usePaddingX: true, usePaddingY: true } as Partial<Config>);
  }

  get paddingX() {
    return this.updateConfig({ usePaddingX: true } as Partial<Config>);
  }

  get paddingY() {
    return this.updateConfig({ usePaddingY: true } as Partial<Config>);
  }

  get radius() {
    return this.updateConfig({ useRadius: true } as Partial<Config>);
  }

  get height() {
    return this.updateConfig({ useHeight: true } as Partial<Config>);
  }

  get width() {
    return this.updateConfig({ useWidth: true } as Partial<Config>);
  }

  get circle() {
    return this.configure({ radius: 1000 });
  }

  get size() {
    return this.updateConfig({ useHeight: true, useWidth: true } as Partial<Config>);
  }

  get noPT() {
    return this.updateConfig({ noPT: true } as Partial<Config>);
  }

  get noPB() {
    return this.updateConfig({ noPB: true } as Partial<Config>);
  }

  get noPL() {
    return this.updateConfig({ noPL: true } as Partial<Config>);
  }

  get noPR() {
    return this.updateConfig({ noPR: true } as Partial<Config>);
  }
}

export const box = new BoxComposer().start();

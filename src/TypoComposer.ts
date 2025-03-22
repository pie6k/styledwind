import { Length, addUnit } from "./utils";

import { StylesComposer } from "./StylesComposer";
import { isDefined } from "./utils/nullish";

export interface TypoConfig {
  fontFamily?: string;
  fontSize?: Length;
  fontWeight?: Length;
  lineHeight?: Length;
  letterSpacing?: Length;
  balance?: boolean;
  case?: "normal" | "uppercase" | "lowercase" | "capitalize";
  underline?: boolean;
  align?: "left" | "center" | "right";
  maxLines?: number;
  ellipsis?: boolean;
  nowrap?: boolean;
  propageteToSvg?: boolean;
  opacity?: number;
}

function getTypoStyles(config: TypoConfig): string[] {
  const styles: string[] = [];

  if (config.fontFamily) {
    styles.push(`font-family: ${config.fontFamily};`);
  }

  if (isDefined(config.opacity)) {
    styles.push(`opacity: ${config.opacity};`);
  }

  if (config.nowrap) {
    styles.push(`white-space: nowrap;`);
  }

  if (config.fontSize && config.propageteToSvg) {
    const resolved = addUnit(config.fontSize, "em");
    styles.push(`svg { font-size: ${resolved}; width: ${resolved}; height: ${resolved}; }`);
  }

  if (config.fontSize) {
    const resolved = addUnit(config.fontSize, "em");
    styles.push(`font-size: ${resolved};`);
  }

  if (config.fontWeight) {
    styles.push(`font-weight: ${config.fontWeight};`);
  }

  if (config.lineHeight) {
    styles.push(`line-height: ${addUnit(config.lineHeight, "em")};`);
  }

  if (config.letterSpacing) {
    styles.push(`letter-spacing: ${addUnit(config.letterSpacing, "em")};`);
  }

  if (config.align) {
    styles.push(`text-align: ${config.align};`);
  }

  if (config.balance) {
    styles.push(`text-wrap: balance;`);
  }

  if (config.maxLines) {
    styles.push(`
      -webkit-line-clamp: ${config.maxLines};
      -webkit-box-orient: vertical;
      overflow: hidden;
      display: -webkit-box;
    `);
  }

  if (config.ellipsis) {
    styles.push(`
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
    `);
  }

  return styles;
}

export class TypoComposer extends StylesComposer<TypoConfig> {
  constructor(config: TypoConfig) {
    super(config);
  }

  family(value: string) {
    return this.updateConfig({ fontFamily: value } as Partial<TypoConfig>);
  }

  size(value: Length) {
    return this.updateConfig({ fontSize: value } as Partial<TypoConfig>);
  }

  weight(value: Length) {
    return this.updateConfig({ fontWeight: value } as Partial<TypoConfig>);
  }

  lineHeight(value: Length) {
    return this.updateConfig({ lineHeight: value } as Partial<TypoConfig>);
  }

  get copyLineHeight() {
    return this.lineHeight(1.5);
  }

  get headingLineHeight() {
    return this.lineHeight(1.25);
  }

  get propageteToSvg() {
    return this.updateConfig({ propageteToSvg: true } as Partial<TypoConfig>);
  }

  get balance() {
    return this.updateConfig({ balance: true } as Partial<TypoConfig>);
  }

  get uppercase() {
    return this.updateConfig({ case: "uppercase" } as Partial<TypoConfig>);
  }

  get lowercase() {
    return this.updateConfig({ case: "lowercase" } as Partial<TypoConfig>);
  }

  get capitalize() {
    return this.updateConfig({ case: "capitalize" } as Partial<TypoConfig>);
  }

  get underline() {
    return this.updateConfig({ underline: true } as Partial<TypoConfig>);
  }

  get left() {
    return this.updateConfig({ align: "left" } as Partial<TypoConfig>);
  }

  get center() {
    return this.updateConfig({ align: "center" } as Partial<TypoConfig>);
  }

  get right() {
    return this.updateConfig({ align: "right" } as Partial<TypoConfig>);
  }

  get ellipsis() {
    return this.updateConfig({ ellipsis: true } as Partial<TypoConfig>);
  }

  get resetLineHeight() {
    return this.updateConfig({ lineHeight: 1 } as Partial<TypoConfig>);
  }

  maxLines(value: number) {
    return this.updateConfig({ maxLines: value } as Partial<TypoConfig>);
  }

  opacity(value: number) {
    return this.updateConfig({ opacity: value } as Partial<TypoConfig>);
  }

  get secondary() {
    return this.opacity(0.5);
  }

  get tertiary() {
    return this.opacity(0.3);
  }

  get w100() {
    return this.weight(100);
  }

  get w200() {
    return this.weight(200);
  }

  get w300() {
    return this.weight(300);
  }

  get w400() {
    return this.weight(400);
  }

  get w500() {
    return this.weight(500);
  }

  get normal() {
    return this.weight(400);
  }

  get w600() {
    return this.weight(600);
  }

  letterSpacing(value: Length) {
    return this.updateConfig({ letterSpacing: value } as Partial<TypoConfig>);
  }

  get w700() {
    return this.weight(700);
  }

  get w800() {
    return this.weight(800);
  }

  get w900() {
    return this.weight(900);
  }

  get nowrap() {
    return this.updateConfig({ nowrap: true } as Partial<TypoConfig>);
  }

  getStyles() {
    return getTypoStyles(this.config);
  }
}

export const typo = new TypoComposer({}).start();

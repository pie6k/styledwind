import type { Property } from "csstype";
import { SpacingBoxConfig } from "./BoxComposer";
import { StylesComposer } from "./StylesComposer";
import { getIsDefined } from "./utils";
import { size } from "./SizeComposer";

interface GridBoxConfig extends SpacingBoxConfig {
  columns?: number | string;
  rows?: number | string;
  gapLevel?: number;
  alignItems?: Property.AlignItems;
  justifyItems?: Property.JustifyItems;
  alignContent?: Property.AlignContent;
  justifyContent?: Property.JustifyContent;
  autoFlow?: Property.GridAutoFlow;
  isInline?: boolean;
}

function getGridBoxStyles(config: GridBoxConfig) {
  const styles: string[] = [];

  if (config.isInline) {
    styles.push(`display: inline-grid;`);
  } else {
    styles.push(`display: grid;`);
  }

  if (getIsDefined(config.columns)) {
    if (typeof config.columns === "number") {
      styles.push(`grid-template-columns: repeat(${config.columns}, 1fr);`);
    } else {
      styles.push(`grid-template-columns: ${config.columns};`);
    }
  }

  if (getIsDefined(config.rows)) {
    if (typeof config.rows === "number") {
      styles.push(`grid-template-rows: repeat(${config.rows}, 1fr);`);
    } else {
      styles.push(`grid-template-rows: ${config.rows};`);
    }
  }

  if (getIsDefined(config.gapLevel)) {
    styles.push(size.level(config.gapLevel).gap.toString() + ";");
  }

  if (getIsDefined(config.alignItems)) {
    styles.push(`align-items: ${config.alignItems};`);
  }

  if (getIsDefined(config.justifyItems)) {
    styles.push(`justify-items: ${config.justifyItems};`);
  }

  if (getIsDefined(config.alignContent)) {
    styles.push(`align-content: ${config.alignContent};`);
  }

  if (getIsDefined(config.justifyContent)) {
    styles.push(`justify-content: ${config.justifyContent};`);
  }

  if (getIsDefined(config.autoFlow)) {
    styles.push(`grid-auto-flow: ${config.autoFlow};`);
  }

  return styles;
}

export class GridComposer<C extends GridBoxConfig> extends StylesComposer<C> {
  constructor(config?: C) {
    super(config ?? ({} as C));
  }

  columns(value: number | string) {
    return this.updateConfig({ columns: value } as Partial<C>);
  }

  rows(value: number | string) {
    return this.updateConfig({ rows: value } as Partial<C>);
  }

  gap(value: number = 1) {
    return this.updateConfig({ gapLevel: value } as Partial<C>);
  }

  alignItems(value: GridBoxConfig["alignItems"]) {
    return this.updateConfig({ alignItems: value } as Partial<C>);
  }

  get alignItemsCenter() {
    return this.alignItems("center");
  }

  get alignItemsStart() {
    return this.alignItems("start");
  }

  get alignItemsEnd() {
    return this.alignItems("end");
  }

  get alignItemsStretch() {
    return this.alignItems("stretch");
  }

  justifyItems(value: GridBoxConfig["justifyItems"]) {
    return this.updateConfig({ justifyItems: value } as Partial<C>);
  }

  get justifyItemsCenter() {
    return this.justifyItems("center");
  }

  get justifyItemsStart() {
    return this.justifyItems("start");
  }

  get justifyItemsEnd() {
    return this.justifyItems("end");
  }

  get justifyItemsStretch() {
    return this.justifyItems("stretch");
  }

  alignContent(value: GridBoxConfig["alignContent"]) {
    return this.updateConfig({ alignContent: value } as Partial<C>);
  }

  get alignContentCenter() {
    return this.alignContent("center");
  }

  get alignContentStart() {
    return this.alignContent("start");
  }

  get alignContentEnd() {
    return this.alignContent("end");
  }

  get alignContentStretch() {
    return this.alignContent("stretch");
  }

  get alignContentBetween() {
    return this.alignContent("space-between");
  }

  get alignContentAround() {
    return this.alignContent("space-around");
  }

  get alignContentEvenly() {
    return this.alignContent("space-evenly");
  }

  justifyContent(value: GridBoxConfig["justifyContent"]) {
    return this.updateConfig({ justifyContent: value } as Partial<C>);
  }

  get justifyContentCenter() {
    return this.justifyContent("center");
  }

  get justifyContentStart() {
    return this.justifyContent("start");
  }

  get justifyContentEnd() {
    return this.justifyContent("end");
  }

  get justifyContentStretch() {
    return this.justifyContent("stretch");
  }

  get justifyContentBetween() {
    return this.justifyContent("space-between");
  }

  get justifyContentAround() {
    return this.justifyContent("space-around");
  }

  get justifyContentEvenly() {
    return this.justifyContent("space-evenly");
  }

  autoFlow(value: GridBoxConfig["autoFlow"]) {
    return this.updateConfig({ autoFlow: value } as Partial<C>);
  }

  get flowRow() {
    return this.autoFlow("row");
  }

  get flowColumn() {
    return this.autoFlow("column");
  }

  get flowRowDense() {
    return this.autoFlow("row dense");
  }

  get flowColumnDense() {
    return this.autoFlow("column dense");
  }

  get center() {
    return this.alignItemsCenter.justifyItemsCenter;
  }

  get inline() {
    return this.updateConfig({ isInline: true } as Partial<C>);
  }

  getStyles() {
    return getGridBoxStyles(this.config);
  }
}

export const grid = new GridComposer().start();

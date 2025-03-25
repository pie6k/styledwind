import { CSSProperties } from "styled-components";
import { Composer } from "./Composer";
import type { Property } from "csstype";
import { convertToRem } from "./utils/convertUnits";

const DISPLAY_GRID: CSSProperties = { display: "grid" };
const DISPLAY_INLINE_GRID: CSSProperties = { display: "inline-grid" };

export class GridComposer extends Composer {
  init() {
    return this.addStyle(DISPLAY_GRID);
  }

  columns(value: CSSProperties["gridTemplateColumns"]) {
    return this.addStyle({ gridTemplateColumns: value });
  }

  rows(value: CSSProperties["gridTemplateRows"]) {
    return this.addStyle({ gridTemplateRows: value });
  }

  gap(value: number = 1) {
    return this.addStyle({ gap: convertToRem(value, "level") + "rem" });
  }

  alignItems(value: Property.AlignItems) {
    return this.addStyle({ alignItems: value });
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

  justifyItems(value: Property.JustifyItems) {
    return this.addStyle({ justifyItems: value });
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

  alignContent(value: Property.AlignContent) {
    return this.addStyle({ alignContent: value });
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

  justifyContent(value: Property.JustifyContent) {
    return this.addStyle({ justifyContent: value });
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

  autoFlow(value: Property.GridAutoFlow) {
    return this.addStyle({ gridAutoFlow: value });
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
    return this.addStyle(DISPLAY_INLINE_GRID);
  }
}

export const grid = new GridComposer().init();

import { CSSProperties } from "styled-components";
import { Composer } from "./Composer";

function levelToRem(level: number) {
  return `${Math.pow(2, level) / 4}rem`;
}

export class FlexComposer extends Composer {
  init() {
    return this.addStyle({ display: "flex" });
  }

  direction(value: CSSProperties["flexDirection"]) {
    return this.addStyle({ flexDirection: value });
  }

  get row() {
    return this.direction("row");
  }

  get column() {
    return this.direction("column");
  }

  /**
   * @alias row
   */
  get horizontal() {
    return this.row;
  }

  /**
   * @alias column
   */
  get vertical() {
    return this.column;
  }

  /**
   * @alias row
   */
  get x() {
    return this.row;
  }

  /**
   * @alias column
   */
  get y() {
    return this.column;
  }

  gap(value: number = 1) {
    return this.addStyle({ gap: levelToRem(value) });
  }

  align(value: CSSProperties["alignItems"]) {
    return this.addStyle({ alignItems: value });
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

  justify(value: CSSProperties["justifyContent"]) {
    return this.addStyle({ justifyContent: value });
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
    return this.addStyle({ flexDirection: "row-reverse" });
  }

  get wrap() {
    return this.addStyle({ flexWrap: "wrap" });
  }

  get inline() {
    return this.addStyle({ display: "inline-flex" });
  }
}

export const flex = new FlexComposer().init();

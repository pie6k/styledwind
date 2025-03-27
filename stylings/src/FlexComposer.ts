import { Composer, composer } from "./Composer";

import { CSSProperties } from "styled-components";
import { convertToRem } from "./utils/convertUnits";

export class FlexComposer extends Composer {
  init() {
    return this.addStyle(`display: flex;`);
  }

  direction(value: CSSProperties["flexDirection"]) {
    return this.addStyle(`flex-direction: ${value};`);
  }

  get row() {
    return this.addStyle(`flex-direction: row;`);
  }

  get column() {
    return this.addStyle(`flex-direction: column;`);
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

  gap(value: number | string = 1) {
    if (typeof value === "string") {
      return this.addStyle(`gap: ${value};`);
    }

    return this.addStyle(`gap: ${convertToRem(value, "level")}rem;`);
  }

  align(value: CSSProperties["alignItems"]) {
    return this.addStyle(`align-items: ${value};`);
  }

  get alignCenter() {
    return this.addStyle(`align-items: center;`);
  }

  get alignStart() {
    return this.addStyle(`align-items: flex-start;`);
  }

  get alignEnd() {
    return this.addStyle(`align-items: flex-end;`);
  }

  get alignStretch() {
    return this.addStyle(`align-items: stretch;`);
  }

  get alignBaseline() {
    return this.addStyle(`align-items: baseline;`);
  }

  justify(value: CSSProperties["justifyContent"]) {
    return this.addStyle(`justify-content: ${value};`);
  }

  get justifyCenter() {
    return this.addStyle(`justify-content: center;`);
  }

  get justifyStart() {
    return this.addStyle(`justify-content: flex-start;`);
  }

  get justifyEnd() {
    return this.addStyle(`justify-content: flex-end;`);
  }

  get justifyBetween() {
    return this.addStyle(`justify-content: space-between;`);
  }

  get justifyAround() {
    return this.addStyle(`justify-content: space-around;`);
  }

  get justifyEvenly() {
    return this.addStyle(`justify-content: space-evenly;`);
  }

  get center() {
    return this.alignCenter.justifyCenter;
  }

  get reverse() {
    return this.addStyle(`flex-direction: row-reverse;`);
  }

  get wrap() {
    return this.addStyle(`flex-wrap: wrap;`);
  }

  get inline() {
    return this.addStyle(`display: inline-flex;`);
  }
}

export const $flex = composer(FlexComposer);

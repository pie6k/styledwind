import { Composer, composer } from "./Composer";

import { CSSProperties } from "styled-components";
import { convertToRem } from "./utils/convertUnits";

const ROW: CSSProperties = { flexDirection: "row" };
const COLUMN: CSSProperties = { flexDirection: "column" };

const ALIGN_CENTER: CSSProperties = { alignItems: "center" };
const ALIGN_START: CSSProperties = { alignItems: "flex-start" };
const ALIGN_END: CSSProperties = { alignItems: "flex-end" };
const ALIGN_STRETCH: CSSProperties = { alignItems: "stretch" };
const ALIGN_BASELINE: CSSProperties = { alignItems: "baseline" };

const JUSTIFY_CENTER: CSSProperties = { justifyContent: "center" };
const JUSTIFY_START: CSSProperties = { justifyContent: "flex-start" };
const JUSTIFY_END: CSSProperties = { justifyContent: "flex-end" };
const JUSTIFY_BETWEEN: CSSProperties = { justifyContent: "space-between" };
const JUSTIFY_AROUND: CSSProperties = { justifyContent: "space-around" };
const JUSTIFY_EVENLY: CSSProperties = { justifyContent: "space-evenly" };

const ROW_REVERSE: CSSProperties = { flexDirection: "row-reverse" };
const WRAP: CSSProperties = { flexWrap: "wrap" };
const INLINE: CSSProperties = { display: "inline-flex" };

const FLEX: CSSProperties = { display: "flex" };

export class FlexComposer extends Composer {
  init() {
    return this.addStyle(FLEX);
  }

  direction(value: CSSProperties["flexDirection"]) {
    return this.addStyle({ flexDirection: value });
  }

  get row() {
    return this.addStyle(ROW);
  }

  get column() {
    return this.addStyle(COLUMN);
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
    return this.addStyle({ gap: `${convertToRem(value, "level")}rem` });
  }

  align(value: CSSProperties["alignItems"]) {
    return this.addStyle({ alignItems: value });
  }

  get alignCenter() {
    return this.addStyle(ALIGN_CENTER);
  }

  get alignStart() {
    return this.addStyle(ALIGN_START);
  }

  get alignEnd() {
    return this.addStyle(ALIGN_END);
  }

  get alignStretch() {
    return this.addStyle(ALIGN_STRETCH);
  }

  get alignBaseline() {
    return this.addStyle(ALIGN_BASELINE);
  }

  justify(value: CSSProperties["justifyContent"]) {
    return this.addStyle({ justifyContent: value });
  }

  get justifyCenter() {
    return this.addStyle(JUSTIFY_CENTER);
  }

  get justifyStart() {
    return this.addStyle(JUSTIFY_START);
  }

  get justifyEnd() {
    return this.addStyle(JUSTIFY_END);
  }

  get justifyBetween() {
    return this.addStyle(JUSTIFY_BETWEEN);
  }

  get justifyAround() {
    return this.addStyle(JUSTIFY_AROUND);
  }

  get justifyEvenly() {
    return this.addStyle(JUSTIFY_EVENLY);
  }

  get center() {
    return this.alignCenter.justifyCenter;
  }

  get reverse() {
    return this.addStyle(ROW_REVERSE);
  }

  get wrap() {
    return this.addStyle(WRAP);
  }

  get inline() {
    return this.addStyle(INLINE);
  }
}

export const $flex = composer(FlexComposer);

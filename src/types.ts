import { StandardPropertiesHyphen, SvgPropertiesHyphen } from "csstype";

export interface CSSStyle extends StandardPropertiesHyphen, SvgPropertiesHyphen {}

export type CSSProperty = keyof CSSStyle;
export type CSSValue<T extends CSSProperty> = CSSStyle[T];

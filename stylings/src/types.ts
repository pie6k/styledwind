import { StandardPropertiesHyphen, SvgPropertiesHyphen } from "csstype";

export interface CSSStyle extends StandardPropertiesHyphen, SvgPropertiesHyphen {}

export type CSSProperty = keyof CSSStyle;
export type CSSValue<T extends CSSProperty> = CSSStyle[T];

export type FilterObjectByValue<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

export type FilterKeysByValue<T, V> = keyof FilterObjectByValue<T, V>;

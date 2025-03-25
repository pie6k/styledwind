import { Composer, PickComposer, getIsComposer } from "./Composer";
import { Primitive, isPrimitive } from "./utils/primitive";
import { ThemedValue, ThemedValueInput, createThemedValue } from "./ThemedValue";
import { createNestedRecordPropertiesMap, mapNestedRecord } from "./utils/nestedRecord";

export type ComposableThemeInputValue = Primitive | Composer | ComposableThemeInputObject;

export type ComposableThemeInputObject = {
  [key: string]: ComposableThemeInputValue;
};

export type PropertiesMap = Map<string, ThemedValue>;

const PROPERTIES = Symbol("theme-composers");
const DEFAULT_THEME = Symbol("default-theme");

interface ComposableThemeData {
  [PROPERTIES]: PropertiesMap;
  [DEFAULT_THEME]: ComposableTheme;
}

export type ComposableTheme<T extends ComposableThemeInputObject = ComposableThemeInputObject> = {
  [K in keyof T]: T[K] extends ThemedValueInput
    ? ThemedValue<T[K]>
    : T[K] extends ComposableThemeInputObject
      ? ComposableTheme<T[K]>
      : T[K];
} & ComposableThemeData;

export type ThemeVariantInputValue<T extends ComposableThemeInputValue> = T extends Primitive
  ? T
  : T extends Composer
    ? PickComposer<T>
    : T extends ComposableThemeInputObject
      ? ThemeVariantInputObject<T>
      : never;

export type ThemeVariantInputObject<T extends ComposableThemeInputObject> = {
  [K in keyof T]?: ThemeVariantInputValue<T[K]>;
};

export type ComposableThemeOrVariant = ComposableTheme | ThemeVariant;

export function createTheme<T extends ComposableThemeInputObject>(themeInput: T): ComposableTheme<T> {
  const propertiesMap = createNestedRecordPropertiesMap(themeInput) as PropertiesMap;

  const theme = mapNestedRecord(themeInput, (value, path) => {
    if (isPrimitive(value)) {
      return createThemedValue(path, value);
    }

    if (getIsComposer(value)) {
      return createThemedValue(path, value);
    }

    return value;
  }) as ComposableTheme<T>;

  theme[PROPERTIES] = propertiesMap;
  theme[DEFAULT_THEME] = theme as ComposableTheme;

  return theme;
}

interface ThemeVariant extends ComposableThemeData {}

export function createThemeVariant<T extends ComposableThemeInputObject>(
  sourceTheme: ComposableTheme<T>,
  variantInput: ThemeVariantInputObject<T>,
): ThemeVariant {
  if (!getIsTheme<T>(sourceTheme)) {
    throw new Error("Can only create theme variant from source theme");
  }

  const changedPropertiesMap = createNestedRecordPropertiesMap(variantInput) as PropertiesMap;

  const propertiesClone: PropertiesMap = new Map();

  for (const [path, value] of changedPropertiesMap.entries()) {
    propertiesClone.set(path, value);
  }

  const result: ThemeVariant = {
    [PROPERTIES]: propertiesClone,
    [DEFAULT_THEME]: sourceTheme as ComposableTheme,
  };

  return result;
}

export function getIsThemeOrVariant(value: unknown): value is ComposableTheme | ThemeVariant {
  return typeof value === "object" && value !== null && PROPERTIES in value;
}

export function getIsTheme<T extends ComposableThemeInputObject>(value: unknown): value is ComposableTheme<T> {
  return getIsThemeOrVariant(value) && value[DEFAULT_THEME] === value;
}

export function getIsThemeVariant(value: unknown): value is ThemeVariant {
  return getIsThemeOrVariant(value) && value[DEFAULT_THEME] !== value;
}

/**
 * @internal
 */
export function getThemePropertiesMap(
  theme: ComposableTheme<ComposableThemeInputObject> | ThemeVariant,
): PropertiesMap {
  return theme[PROPERTIES];
}

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
const VARIANT_CHANGED_PROPERTIES = Symbol("variant-changed-properties");
const DEFAULT_THEME = Symbol("default-theme");

interface ComposableThemeData<T extends ComposableThemeInputObject> {
  [PROPERTIES]: PropertiesMap;
  [DEFAULT_THEME]: ComposableTheme<T>;
}

interface ComposableThemeVariantData<T extends ComposableThemeInputObject> extends ComposableThemeData<T> {
  [VARIANT_CHANGED_PROPERTIES]: PropertiesMap;
}

export type ComposableTheme<T extends ComposableThemeInputObject = ComposableThemeInputObject> = {
  [K in keyof T]: T[K] extends ThemedValueInput
    ? ThemedValue<T[K]>
    : T[K] extends ComposableThemeInputObject
      ? ComposableTheme<T[K]>
      : T[K];
} & ComposableThemeData<T>;

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

export type ComposableThemeOrVariant<T extends ComposableThemeInputObject> = ComposableTheme<T> | ThemeVariant<T>;

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
  theme[DEFAULT_THEME] = theme as ComposableTheme<T>;

  return theme;
}

export interface ThemeVariant<T extends ComposableThemeInputObject> extends ComposableThemeVariantData<T> {}

export function createThemeVariant<T extends ComposableThemeInputObject>(
  sourceTheme: ComposableTheme<T>,
  variantInput: ThemeVariantInputObject<T>,
): ThemeVariant<T> {
  if (!getIsTheme<T>(sourceTheme)) {
    throw new Error("Can only create theme variant from source theme");
  }

  const changedPropertiesMap = createNestedRecordPropertiesMap(variantInput) as PropertiesMap;

  const propertiesClone: PropertiesMap = new Map();

  for (const [path, value] of changedPropertiesMap.entries()) {
    propertiesClone.set(path, value);
  }

  const result: ThemeVariant<T> = {
    [PROPERTIES]: propertiesClone,
    [VARIANT_CHANGED_PROPERTIES]: changedPropertiesMap,
    [DEFAULT_THEME]: sourceTheme as ComposableTheme<T>,
  };

  return result;
}

export function getIsThemeOrVariant<T extends ComposableThemeInputObject>(
  value: unknown,
): value is ComposableTheme<T> | ThemeVariant<T> {
  return typeof value === "object" && value !== null && PROPERTIES in value;
}

export function getIsTheme<T extends ComposableThemeInputObject>(value: unknown): value is ComposableTheme<T> {
  return getIsThemeOrVariant(value) && value[DEFAULT_THEME] === value;
}

export function getIsThemeVariant<T extends ComposableThemeInputObject>(value: unknown): value is ThemeVariant<T> {
  return getIsThemeOrVariant(value) && value[DEFAULT_THEME] !== value;
}

/**
 * @internal
 */
export function getThemePropertiesMap<T extends ComposableThemeInputObject>(
  theme: ComposableTheme<T> | ThemeVariant<T>,
): PropertiesMap {
  return theme[PROPERTIES];
}

export function getThemeVariantChangedPropertiesMap<T extends ComposableThemeInputObject>(
  theme: ThemeVariant<T>,
): PropertiesMap {
  return theme[VARIANT_CHANGED_PROPERTIES];
}

export function composeThemeVariants<T extends ComposableThemeInputObject>(
  sourceTheme: ComposableTheme<T>,
  variants: ThemeVariant<T>[],
): ThemeVariant<T> {
  const changedProperties: PropertiesMap = new Map();

  for (const variant of variants) {
    if (variant[DEFAULT_THEME] !== sourceTheme) {
      throw new Error("All variants must have the same source theme");
    }

    const variantProperties = getThemeVariantChangedPropertiesMap(variant);

    for (const [path, value] of variantProperties.entries()) {
      changedProperties.set(path, value);
    }
  }

  const resolvedProperties = getThemePropertiesMap(sourceTheme);

  for (const [path, value] of changedProperties.entries()) {
    resolvedProperties.set(path, value);
  }

  return {
    [PROPERTIES]: resolvedProperties,
    [VARIANT_CHANGED_PROPERTIES]: changedProperties,
    [DEFAULT_THEME]: sourceTheme as ComposableTheme<T>,
  };
}

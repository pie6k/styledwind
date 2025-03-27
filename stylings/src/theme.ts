import { Composer, PickComposer, getIsComposer } from "./Composer";
import { Primitive, isPrimitive } from "./utils/primitive";
import { ThemedValue, ThemedValueInput, createThemedValue } from "./ThemedValue";
import { createNestedRecordPropertiesMap, mapNestedRecord } from "./utils/nestedRecord";

export type ThemeInputValue = Primitive | Composer | ThemeInput;

export type ThemeInput = {
  [key: string]: ThemeInputValue;
};

export type PropertiesMap = Map<string, ThemedValue>;

const PROPERTIES = Symbol("theme-composers");
const VARIANT_CHANGED_PROPERTIES = Symbol("variant-changed-properties");
const DEFAULT_THEME = Symbol("default-theme");

interface ThemeData<T extends ThemeInput> {
  [PROPERTIES]: PropertiesMap;
  [DEFAULT_THEME]: Theme<T>;
}

interface ThemeVariantData<T extends ThemeInput> extends ThemeData<T> {
  [VARIANT_CHANGED_PROPERTIES]: PropertiesMap;
}

export type Theme<T extends ThemeInput = ThemeInput> = {
  [K in keyof T]: T[K] extends ThemedValueInput ? ThemedValue<T[K]> : T[K] extends ThemeInput ? Theme<T[K]> : never;
} & ThemeData<T>;

export type ThemeVariantInputValue<T extends ThemeInputValue> = T extends Primitive
  ? T
  : T extends Composer
    ? PickComposer<T>
    : T extends ThemeInput
      ? ThemeVariantInput<T>
      : never;

export type ThemeVariantInput<T extends ThemeInput> = {
  [K in keyof T]?: ThemeVariantInputValue<T[K]>;
};

export type ThemeOrVariant<T extends ThemeInput> = Theme<T> | ThemeVariant<T>;

export function createTheme<T extends ThemeInput>(themeInput: T): Theme<T> {
  const propertiesMap = createNestedRecordPropertiesMap(themeInput) as PropertiesMap;

  const theme = mapNestedRecord(themeInput, (value, path) => {
    if (isPrimitive(value)) {
      return createThemedValue(path, value);
    }

    if (getIsComposer(value)) {
      return createThemedValue(path, value);
    }

    return value;
  }) as Theme<T>;

  theme[PROPERTIES] = propertiesMap;
  theme[DEFAULT_THEME] = theme as Theme<T>;

  return theme;
}

export interface ThemeVariant<T extends ThemeInput> extends ThemeVariantData<T> {}

export function createThemeVariant<T extends ThemeInput>(
  sourceTheme: Theme<T>,
  variantInput: ThemeVariantInput<T>,
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
    [DEFAULT_THEME]: sourceTheme as Theme<T>,
  };

  return result;
}

export function getIsThemeOrVariant<T extends ThemeInput>(value: unknown): value is ThemeOrVariant<T> {
  if (typeof value !== "object" || value === null) return false;

  return PROPERTIES in value;
}

export function getIsTheme<T extends ThemeInput>(value: unknown): value is Theme<T> {
  if (typeof value !== "object" || value === null) return false;

  return DEFAULT_THEME in value && value[DEFAULT_THEME] === value;
}

export function getIsThemeVariant<T extends ThemeInput>(value: unknown): value is ThemeVariant<T> {
  if (typeof value !== "object" || value === null) return false;

  return DEFAULT_THEME in value && value[DEFAULT_THEME] !== value;
}

/**
 * @internal
 */
export function getThemeValueByPath<T extends ThemeInput>(
  theme: ThemeOrVariant<T>,
  path: string,
): ThemedValue | undefined {
  return theme[PROPERTIES].get(path);
}

export function composeThemeVariants<T extends ThemeInput>(
  sourceTheme: Theme<T>,
  variants: ThemeVariant<T>[],
): ThemeVariant<T> {
  const changedProperties: PropertiesMap = new Map();

  for (const variant of variants) {
    if (variant[DEFAULT_THEME] !== sourceTheme) {
      throw new Error("All variants must have the same source theme");
    }

    const variantProperties = variant[VARIANT_CHANGED_PROPERTIES];

    for (const [path, value] of variantProperties.entries()) {
      changedProperties.set(path, value);
    }
  }

  const resolvedProperties = new Map(sourceTheme[PROPERTIES]);

  for (const [path, value] of changedProperties.entries()) {
    resolvedProperties.set(path, value);
  }

  return {
    [PROPERTIES]: resolvedProperties,
    [VARIANT_CHANGED_PROPERTIES]: changedProperties,
    [DEFAULT_THEME]: sourceTheme as Theme<T>,
  };
}

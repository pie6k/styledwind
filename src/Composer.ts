import { CSSProperties, RuleSet } from "styled-components";
import { getHasValue, maybeValue } from "./utils/maybeValue";

import { ComposerConfig } from "./ComposerConfig";
import { MaybeUndefined } from "./utils/types";
import { compileComposerStyles } from "./compilation";
import { createValueReuser } from "./utils/reuse";
import { isNotNullish } from "./utils/nullish";

export interface GetStylesProps {
  theme?: ThemeOrThemeProps;
}
export type ThemeOrThemeProps = GetStylesProps | object;

export type GetStyles = (propsOrTheme?: ThemeOrThemeProps) => CompileResult;
export type ComposerStyle = CSSProperties | string | Composer | RuleSet;

export type StyledComposer<T extends Composer> = T extends GetStyles ? T : T & GetStyles;
export type AnyStyledComposer = StyledComposer<Composer>;

export type PickComposer<T> = T extends StyledComposer<infer U> ? U : never;

export type CompileResult = string | string[] | RuleSet | null | Array<CompileResult>;

function getIsStyledComposer(value: unknown): value is StyledComposer<Composer> {
  return typeof value === "function";
}

type ConstructorOf<T> = new (...args: any[]) => T;

interface HolderFunction {
  (): void;
  composer: Composer;
}

const composerHolderFunctionProxyHandler: ProxyHandler<HolderFunction> = {
  get(holderFunction, prop, receiver) {
    if (prop === "composer") {
      return holderFunction.composer;
    }

    return Reflect.get(holderFunction.composer, prop, receiver);
  },
  set(holderFunction, prop, value) {
    return Reflect.set(holderFunction.composer, prop, value);
  },
  apply(holderFunction) {
    return holderFunction.composer.compile();
  },
  getPrototypeOf(target) {
    return Object.getPrototypeOf(target.composer);
  },
};

export function getIsComposer(input: unknown): input is Composer {
  return input instanceof Composer;
}

export function pickComposer<C extends Composer>(input: C): C {
  if (getIsStyledComposer(input)) {
    return input.composer as C;
  }

  if (getIsComposer(input)) {
    return input;
  }

  throw new Error("Invalid composer");
}

export class Composer {
  readonly styles: ComposerStyle[] = [];
  readonly configs: Map<ComposerConfig, unknown> = new Map();

  constructor() {
    const compileStyles: HolderFunction = () => {};
    compileStyles.composer = this;

    const styledComposer = new Proxy(compileStyles, composerHolderFunctionProxyHandler) as unknown as Composer;

    return styledComposer as StyledComposer<typeof this>;
  }

  private readonly reuseProperties = createValueReuser<CSSProperties>();

  get composer() {
    return pickComposer(this);
  }

  clone<T extends Composer>(this: T): StyledComposer<T> {
    const newComposer = new (this.constructor as ConstructorOf<T>)() as StyledComposer<T>;

    return newComposer;
  }

  updateConfig<T extends Composer, C>(this: T, config: ComposerConfig<C>, changes: Partial<C>): StyledComposer<T> {
    return this.setConfig(config, { ...this.getConfig(config), ...changes });
  }

  private reuseConfig = createValueReuser<any>();
  private reuseConfigMap = new Map<unknown, StyledComposer<any>>();

  setConfig<T extends Composer, C>(this: T, config: ComposerConfig<C>, value: C): StyledComposer<T> {
    value = this.reuseConfig(value);

    let clone = this.reuseConfigMap.get(value) as StyledComposer<T> | undefined;

    if (clone) {
      return clone;
    }

    clone = new (this.constructor as ConstructorOf<T>)() as StyledComposer<T>;

    // @ts-expect-error
    clone.configs = new Map(this.configs);

    clone.configs.set(config, value);

    // @ts-expect-error
    clone.styles = this.styles;

    this.reuseConfigMap.set(value, clone);

    return clone;
  }

  getConfig<C>(config: ComposerConfig<C>): C {
    const existingConfig = this.configs?.get(config) as MaybeUndefined<C>;

    return existingConfig ?? config.defaultConfig;
  }

  private reuseStyle(style: ComposerStyle): ComposerStyle {
    if (typeof style === "string") return style;

    if (getIsComposer(style)) return style;

    if (Array.isArray(style)) return style;

    return this.reuseProperties(style);
  }

  private reuseStyleMap = new Map<ComposerStyle, StyledComposer<any>>();

  addStyle<T extends Composer>(this: T, style: ComposerStyle): StyledComposer<T> {
    style = this.reuseStyle(style);

    let clone = this.reuseStyleMap.get(style) as StyledComposer<T> | undefined;

    if (clone) {
      return clone;
    }

    clone = this.clone();

    // @ts-expect-error
    clone.styles = [...this.styles, style];

    // @ts-expect-error
    clone.configs = this.configs;

    this.reuseStyleMap.set(style, clone);

    return clone;
  }

  init() {
    return this as StyledComposer<typeof this>;
  }

  protected compileCache = maybeValue<CompileResult>();

  compile(addedStyles?: ComposerStyle): CompileResult {
    if (!this.styles && !addedStyles) return null;

    if (getHasValue(this.compileCache)) {
      return this.compileCache;
    }

    this.compileCache = compileComposerStyles([...(this.styles ?? []), addedStyles].filter(isNotNullish));

    return this.compileCache;
  }
}

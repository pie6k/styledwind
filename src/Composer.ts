import { CSSProperties, RuleSet } from "styled-components";
import { ValueReuser, createValueReuser } from "./utils/reuse";

import { ComposerConfig } from "./ComposerConfig";
import { MaybeUndefined } from "./utils/types";
import { compileComposerStyles } from "./compilation";
import { memoizePrototypeOf } from "./utils/memoizePrototype";

export type GetStyles = () => string;
export type ComposerStyle = CSSProperties | string | Composer;

export type StyledComposer<T extends Composer> = T extends GetStyles ? T : T & GetStyles;
export type AnyStyledComposer = StyledComposer<Composer>;

type CompileResult = string | string[] | RuleSet | null | Array<CompileResult>;
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

export abstract class Composer {
  readonly styles?: ComposerStyle[] = [];
  readonly configs?: Map<ComposerConfig, unknown>;

  constructor() {
    const compileStyles: HolderFunction = () => {};
    compileStyles.composer = this;

    const styledComposer = new Proxy(compileStyles, composerHolderFunctionProxyHandler) as unknown as Composer;

    memoizePrototypeOf(styledComposer, ["reuseStyle", "addStyle", "updateConfig", "clone"]);

    return styledComposer;
  }

  private readonly reuseProperties = createValueReuser<CSSProperties>();

  reuseStyle(style: ComposerStyle): ComposerStyle {
    if (typeof style === "string") return style;

    if (getIsComposer(style)) return style;

    return this.reuseProperties(style);
  }

  get composer() {
    return this;
  }

  clone<T extends Composer>(this: T): StyledComposer<T> {
    const newComposer = new (this.constructor as ConstructorOf<T>)() as StyledComposer<T>;

    return newComposer;
  }

  updateConfig<T extends Composer, C>(this: T, config: ComposerConfig<C>, changes: Partial<C>): StyledComposer<T> {
    return this.setConfig(config, { ...this.getConfig(config), ...changes });
  }

  setConfigInner<T extends Composer, C>(this: T, config: ComposerConfig<C>, value: C): StyledComposer<T> {
    const clone = new (this.constructor as ConstructorOf<T>)() as StyledComposer<T>;

    // @ts-expect-error
    clone.configs = new Map(this.configs);

    clone.configs.set(config, value);

    return clone;
  }

  private reuseConfigValue = createValueReuser<unknown>();

  setConfig<T extends Composer, C>(this: T, config: ComposerConfig<C>, value: C): StyledComposer<T> {
    return this.setConfigInner(config, this.reuseConfigValue(value));
  }

  getConfig<C>(config: ComposerConfig<C>): C {
    const existingConfig = this.configs?.get(config) as MaybeUndefined<C>;

    return existingConfig ?? config.defaultConfig;
  }

  private addStyleInner<T extends Composer>(this: T, style: ComposerStyle): StyledComposer<T> {
    const clone = this.clone();

    // @ts-expect-error
    clone.styles = [...(this.styles ?? [])];

    clone.styles.push(style);

    return clone;
  }

  addStyle<T extends Composer>(this: T, style: ComposerStyle): StyledComposer<T> {
    return this.addStyleInner(this.reuseStyle(style));
  }

  init() {
    return this as StyledComposer<typeof this>;
  }

  compile(): CompileResult {
    if (!this.styles) return null;

    return compileComposerStyles(this.styles);
  }
}

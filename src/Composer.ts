import { CSSProperties, RuleSet, css } from "styled-components";
import { getHasValue, maybeValue } from "./utils/maybeValue";

import { ComposerConfig } from "./ComposerConfig";
import { MaybeUndefined } from "./utils/types";
import { memoizePrototypeOf } from "./utils/memoizePrototype";

type CompileResult = string | string[] | RuleSet | null | Array<CompileResult>;
type ConstructorOf<T> = new (...args: any[]) => T;

interface HolderFunction {
  (): void;
  styler: Composer;
}

const stylerFunctionProxyHandler: ProxyHandler<HolderFunction> = {
  get(holderFunction, prop, receiver) {
    if (prop === "styler") {
      return holderFunction.styler;
    }

    return Reflect.get(holderFunction.styler, prop, receiver);
  },
  set(holderFunction, prop, value) {
    return Reflect.set(holderFunction.styler, prop, value);
  },
  apply(holderFunction) {
    return holderFunction.styler.compile();
  },
  getPrototypeOf(target) {
    return Object.getPrototypeOf(target.styler);
  },
};

type GetStylesFunction = () => string;

export type StyledComposer<T extends Composer> = T extends GetStylesFunction ? T : T & GetStylesFunction;
export type PickComposer<T extends StyledComposer<any>> = T extends StyledComposer<infer U> ? U : never;

export type AnyStyledComposer = StyledComposer<Composer>;

export type ComposerStyle = CSSProperties | string | Composer;

function compileStyle(style: ComposerStyle): CompileResult {
  if (getIsComposer(style)) return style.compile();
  if (typeof style === "string") return style;

  return css`
    ${{ ...style }}
  `;
}

function compileStyles(styles: ComposerStyle[]): CompileResult {
  return styles.map(compileStyle);
}

export function getIsComposer(input: unknown): input is Composer {
  return input instanceof Composer;
}

export abstract class Composer {
  readonly styles: ComposerStyle[] = [];
  readonly configs = new Map<ComposerConfig, unknown>();

  constructor() {
    const getStyles: HolderFunction = () => {};
    getStyles.styler = this;

    const proxy = new Proxy(getStyles, stylerFunctionProxyHandler) as unknown as Composer;

    // console.log(proxy.styler.__proto__);
    memoizePrototypeOf(proxy);

    return proxy;
  }

  get composer() {
    return this;
  }

  private clone<T extends Composer>(this: T): StyledComposer<T> {
    const newComposer = new (this.constructor as ConstructorOf<T>)() as StyledComposer<T>;

    return newComposer;
  }

  updateConfig<T extends Composer, C>(this: T, config: ComposerConfig<C>, changes: Partial<C>): StyledComposer<T> {
    return this.setConfig(config, { ...this.getConfig(config), ...changes });
  }

  setConfig<T extends Composer, C>(this: T, config: ComposerConfig<C>, value: C): StyledComposer<T> {
    const clone = new (this.constructor as ConstructorOf<T>)() as StyledComposer<T>;

    // @ts-expect-error
    clone.configs = new Map(this.configs);

    clone.configs.set(config, value);

    return clone;
  }

  getConfig<C>(config: ComposerConfig<C>): C {
    const existingConfig = this.configs.get(config) as MaybeUndefined<C>;

    return existingConfig ?? config.defaultConfig;
  }

  addStyle<T extends Composer>(this: T, style: ComposerStyle): StyledComposer<T> {
    const clone = this.clone();

    // @ts-expect-error
    clone.styles = [...this.styles];

    clone.styles.push(style);

    return clone;
  }

  init() {
    return this as StyledComposer<typeof this>;
  }

  compile(): CompileResult {
    return compileStyles(this.styles);
  }
}

import { CSSProperties, RuleSet } from "styled-components";
import { getHasValue, maybeValue } from "./utils/maybeValue";

import { ComposerConfig } from "./ComposerConfig";
import { DeepMap } from "./utils/map/DeepMap";
import { HashMap } from "./utils/map/HashMap";
import { MaybeUndefined } from "./utils/nullish";
import { compileComposerStyles } from "./compilation";
import { getObjectId } from "./utils/objectId";
import { isPrimitive } from "./utils/primitive";
import { memoizeFn } from "./utils/memoize";

const IS_COMPOSER = Symbol("isComposer");

export interface GetStylesProps {
  theme?: ThemeOrThemeProps;
}
export type ThemeOrThemeProps = GetStylesProps | object;

export type GetStyles = (propsOrTheme?: ThemeOrThemeProps) => CompileResult;
export type ComposerStyle = CSSProperties | string | Composer | RuleSet | Array<ComposerStyle>;

export type StyledComposer<T extends Composer> = T extends GetStyles ? T : T & GetStyles;
export type AnyStyledComposer = StyledComposer<Composer>;

export type PickComposer<T> = T extends StyledComposer<infer U> ? U : never;

export type CompileResult = string | string[] | RuleSet | null | Array<CompileResult>;

function getIsStyledComposer<C extends Composer>(value: C): value is StyledComposer<C> {
  return typeof value === "function";
}

type ConstructorOf<T> = new (...args: any[]) => T;

interface HolderFunction {
  (): void;
  composer: Composer;
}

const composerHolderFunctionProxyHandler: ProxyHandler<HolderFunction> = {
  get(holderFunction, prop) {
    if (prop === "composer") {
      return holderFunction.composer;
    }

    // return Reflect.get(holderFunction.composer, prop, receiver);

    return holderFunction.composer[prop as keyof Composer];
  },
  set(holderFunction, prop, value) {
    // @ts-expect-error
    holderFunction.composer[prop as keyof Composer] = value;

    return true;
  },
  apply(holderFunction) {
    return holderFunction.composer.compile();
  },
  getPrototypeOf(target) {
    return Object.getPrototypeOf(target.composer);
  },
  deleteProperty(target, prop) {
    return Reflect.deleteProperty(target.composer, prop);
  },
  has(target, prop) {
    return Reflect.has(target.composer, prop);
  },
  ownKeys(target) {
    return Reflect.ownKeys(target.composer);
  },
  getOwnPropertyDescriptor(target, prop) {
    return Reflect.getOwnPropertyDescriptor(target.composer, prop);
  },
  setPrototypeOf(target, proto) {
    return Reflect.setPrototypeOf(target.composer, proto);
  },
  isExtensible(target) {
    return Reflect.isExtensible(target.composer);
  },
  preventExtensions(target) {
    return Reflect.preventExtensions(target.composer);
  },
};

export function getIsComposer(input: unknown): input is Composer {
  if (isPrimitive(input)) return false;

  return IS_COMPOSER in (input as object);
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

let isCreatingWithComposerFunction = false;

const warnAboutCreatingInstanceDirectly = memoizeFn((constructor: typeof Composer) => {
  const name = constructor.name;
  console.warn(
    `Seems you are creating ${name} composer using "const instance = new ${name}()". Use "const instance = composer(${name})" instead.`,
  );
});

const EMPTY_CONFIGS = new Map<ComposerConfig, unknown>();
const EMPTY_STYLES: ComposerStyle[] = [];

export class Composer {
  readonly styles: ComposerStyle[] = EMPTY_STYLES;
  readonly configs: Map<ComposerConfig, unknown> = EMPTY_CONFIGS;

  readonly [IS_COMPOSER] = true;

  constructor() {
    if (!isCreatingWithComposerFunction) {
      warnAboutCreatingInstanceDirectly(this.constructor as typeof Composer);
    }
    // return;
    const compileStyles: HolderFunction = () => {};

    compileStyles.composer = this;

    return new Proxy(compileStyles, composerHolderFunctionProxyHandler) as StyledComposer<typeof this>;
  }

  get composer() {
    return pickComposer(this);
  }

  clone<T extends Composer>(
    this: T,
    styles: ComposerStyle[],
    configs: Map<ComposerConfig, unknown>,
  ): StyledComposer<T> {
    try {
      isCreatingWithComposerFunction = true;

      const newComposer = new (this.constructor as ConstructorOf<T>)() as StyledComposer<T>;

      // @ts-expect-error
      newComposer.styles = styles;
      // @ts-expect-error
      newComposer.configs = configs;

      return newComposer;
    } finally {
      isCreatingWithComposerFunction = false;
    }
  }

  private updateConfigCache = new DeepMap(HashMap);

  updateConfig<T extends Composer, C>(this: T, config: ComposerConfig<C>, changes: Partial<C>): StyledComposer<T> {
    const key = [config, changes];

    let clone = this.updateConfigCache.get(key) as StyledComposer<T> | undefined;

    if (clone) {
      return clone;
    }

    const existingConfig = this.getConfig(config);

    if (!existingConfig) {
      clone = this.setConfig(config, { ...config.defaultConfig, ...changes });
    } else {
      clone = this.setConfig(config, { ...existingConfig, ...changes });
    }

    this.updateConfigCache.set(key, clone);

    return clone;
  }

  private setConfig<T extends Composer, C>(this: T, config: ComposerConfig<C>, value: C): StyledComposer<T> {
    const configs = new Map(this.configs);

    configs.set(config, value);

    return this.clone(this.styles, configs);
  }

  getConfig<C>(config: ComposerConfig<C>): C {
    const existingConfig = this.configs?.get(config) as MaybeUndefined<C>;

    return existingConfig ?? config.defaultConfig;
  }

  private reuseStyleMap = new HashMap<ComposerStyle, StyledComposer<any>>();

  addStyle<T extends Composer>(this: T, style: ComposerStyle): StyledComposer<T> {
    let clone = this.reuseStyleMap.get(style) as StyledComposer<T> | undefined;

    if (clone) {
      return clone;
    }

    clone = this.clone([...this.styles, style], this.configs);

    this.reuseStyleMap.set(style, clone);

    return clone;
  }

  init() {
    return this as StyledComposer<typeof this>;
  }

  protected compileCache = maybeValue<CompileResult>();

  compile(addedStyles?: ComposerStyle): CompileResult {
    if (getHasValue(this.compileCache)) {
      return this.compileCache;
    }

    this.compileCache = compileComposerStyles(addedStyles ? [...this.styles, addedStyles] : this.styles);

    return this.compileCache;
  }
}

export function composer<T extends Composer>(Composer: ConstructorOf<T>): StyledComposer<T> {
  try {
    isCreatingWithComposerFunction = true;
    const composer = new Composer();

    return composer.init();
  } finally {
    isCreatingWithComposerFunction = false;
  }
}

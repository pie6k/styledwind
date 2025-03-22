import { EqualKeyMap } from "./utils/map/EqualKeyMap";
import { assertGet } from "./utils/assert";

type GetStylesResult = string | string[] | null;
type ConstructorOf<T> = new (...args: any[]) => T;
type HolderFunction = () => void;

const holderToStyler = new WeakMap<HolderFunction, StylesComposer<any>>();
const proxyToStyler = new WeakMap<StylesComposer<any>, StylesComposer<any>>();

function updateConfig<Config>(this: StylesComposer<Config>, changes: Partial<Config>) {
  const StylerClass = this.constructor as ConstructorOf<StylesComposer<Config>>;

  const styler = assertGet(proxyToStyler.get(this), "Styler not found") as StylesComposer<Config>;

  let resultStyler = styler.cache.get(changes);

  if (resultStyler) {
    return resultStyler;
  }

  resultStyler = new StylerClass({ ...styler.config, ...changes });

  styler.cache.set(changes, resultStyler);

  return resultStyler;
}

function start<Config>(this: StylesComposer<Config>) {
  return this;
}

const stylerFunctionProxyHandler: ProxyHandler<HolderFunction> = {
  get(holderFunction, prop, receiver) {
    if (prop === "updateConfig") {
      return updateConfig;
    }

    if (prop === "start") {
      return start;
    }

    const styler = assertGet(holderToStyler.get(holderFunction), "Styler not found");

    return Reflect.get(styler, prop, receiver);
  },
  apply(holderFunction) {
    const styler = assertGet(holderToStyler.get(holderFunction), "Styler not found");

    let result = styler[cachedResult];

    if (result !== undefined) {
      return result;
    }

    result = styler.getStyles();

    styler[cachedResult] = result;

    return result;
  },
};

const cachedResult = Symbol("cachedResult");

type GetStylesFunction = () => string;

export type StyledStylesComposer<T extends StylesComposer<any>> = T extends GetStylesFunction
  ? T
  : T & GetStylesFunction;

export type AnyStylesComposer = StyledStylesComposer<StylesComposer<any>>;

export abstract class StylesComposer<Config = {}> {
  readonly cache = new EqualKeyMap<Partial<Config>, StylesComposer<Config>>();

  constructor(readonly config: Config) {
    const holderFunction: HolderFunction = () => {};

    const stylerProxy = new Proxy(holderFunction, stylerFunctionProxyHandler) as unknown as StylesComposer<Config>;

    holderToStyler.set(holderFunction, this);
    proxyToStyler.set(stylerProxy, this);

    return stylerProxy as unknown as StyledStylesComposer<StylesComposer<Config>>;
  }

  updateConfig<T extends StylesComposer<Config>>(this: T, changes: Partial<Config>): StyledStylesComposer<T> {
    console.warn("This should never be reached", this, changes);
    return this as unknown as StyledStylesComposer<T>;
  }

  start() {
    return this as unknown as StyledStylesComposer<typeof this>;
  }

  private [cachedResult]: GetStylesResult | undefined;

  abstract getStyles(): GetStylesResult;

  toString() {
    const styles = this.getStyles();

    if (Array.isArray(styles)) {
      return styles.join("\n");
    }

    return styles ?? "";
  }
}

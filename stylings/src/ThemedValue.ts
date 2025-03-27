import { CompileResult, Composer, ThemeOrThemeProps, getIsComposer } from "./Composer";
import { Primitive, isPrimitive } from "./utils/primitive";
import { ThemeInput, ThemeOrVariant, getIsThemeOrVariant, getThemeValueByPath } from "./theme";

import { HashMap } from "./utils/map/HashMap";
import { memoizeFn } from "./utils/memoize";

interface ThemedComposerHolder<C extends Composer> {
  (propsOrTheme?: unknown): CompileResult;
  manager: ThemedComposerManager<C>;
  prototypeInfo: AnalyzedPrototype;
}

type RepeatStep =
  | {
      type: "get";
      property: string;
      propertyType: "getter" | "method";
    }
  | {
      type: "apply";
      args: unknown[];
    };

const repeatStepsOnComposer = memoizeFn(
  function repeatStepsOnComposer<C extends Composer>(composer: C, steps: RepeatStep[]): C {
    if (getIsThemedComposer(composer)) {
      throw new Error("Cannot repeat steps on a themed composer. Underlying composer should be passed");
    }

    let result: unknown = composer;
    let currentThis = result;

    for (const step of steps) {
      if (step.type === "get") {
        result = (result as Composer)[step.property as keyof Composer];

        if (step.propertyType === "getter") {
          currentThis = result;

          if (!getIsComposer(result)) {
            throw new Error(
              `Themed composer called a getter that did not return a composer: ${step.property.toString()}`,
            );
          }
        }
      } else if (step.type === "apply") {
        if (typeof result !== "function") {
          throw new Error("Cannot apply a non-function");
        }

        const functionToApply = result as Function;

        result = result.apply(currentThis, step.args);
        currentThis = result;

        if (!getIsComposer(result)) {
          throw new Error(`Themed composer called a method that did not return a composer (${functionToApply.name})`);
        }
      }
    }

    return result as C;
  },
  { mode: "weak" },
);

interface AnalyzedPrototype {
  getters: Set<string>;
  methods: Set<string>;
}

const analytzePrototype = memoizeFn(
  (prototype: object) => {
    const result: AnalyzedPrototype = {
      getters: new Set(),
      methods: new Set(),
    };

    while (prototype) {
      if (!prototype || prototype === Object.prototype) {
        break;
      }

      const descriptors = Object.getOwnPropertyDescriptors(prototype);

      for (const key in descriptors) {
        const descriptor = descriptors[key];

        if (descriptor.get) {
          result.getters.add(key);
        } else if (typeof descriptor.value === "function") {
          result.methods.add(key);
        }
      }

      prototype = Object.getPrototypeOf(prototype);
    }

    return result;
  },
  { mode: "weak" },
);

const IS_THEMED_COMPOSER = Symbol("isThemedComposer");

const themedComposerHolderProxyHandler: ProxyHandler<ThemedComposerHolder<Composer>> = {
  get(holder, prop) {
    const prototypeInfo = holder.prototypeInfo;

    if (prototypeInfo.getters.has(prop as string)) {
      return holder.manager.addStep({ type: "get", property: prop as string, propertyType: "getter" });
    }

    if (prototypeInfo.methods.has(prop as string)) {
      return holder.manager.addStep({ type: "get", property: prop as string, propertyType: "method" });
    }

    return holder.manager.defaultComposer[prop as keyof Composer];
  },
  apply(target, _thisArg, argArray) {
    if (!target.manager.canCompile) {
      return target.manager.addStep({ type: "apply", args: argArray });
    }

    return target.manager.applyForProps(argArray[0]);
  },
  has(target, prop) {
    if (prop === IS_THEMED_COMPOSER) {
      return true;
    }

    return Reflect.has(target.manager.defaultComposer, prop);
  },
  set(target, prop, value) {
    throw new Error("Cannot set a property on a themed composer");
  },
};

function getThemeFromCallArg<T extends ThemeInput>(propsOrTheme?: ThemeOrThemeProps): ThemeOrVariant<T> | null {
  if (!propsOrTheme) {
    return null;
  }

  if (getIsThemeOrVariant(propsOrTheme)) {
    return propsOrTheme as ThemeOrVariant<T>;
  }

  if (!("theme" in propsOrTheme)) return null;

  const maybeTheme = propsOrTheme.theme;

  if (maybeTheme === undefined) {
    return null;
  }

  if (getIsThemeOrVariant(maybeTheme)) {
    return maybeTheme as ThemeOrVariant<T>;
  }

  throw new Error("There is some value provided as theme in props, but it is has unknown type");
}

export function getIsThemedComposer(value: unknown): value is Composer {
  if (isPrimitive(value)) return false;

  return IS_THEMED_COMPOSER in (value as object);
}

function createThemedComposer<C extends Composer>(defaultComposer: C, path: string, steps: RepeatStep[]) {
  const getThemedValue: ThemedComposerHolder<C> = () => null;
  const manager = new ThemedComposerManager<C>(defaultComposer, path, steps);
  getThemedValue.manager = manager;
  getThemedValue.prototypeInfo = analytzePrototype(defaultComposer);

  return new Proxy(getThemedValue, themedComposerHolderProxyHandler) as unknown as C;
}

class ThemedComposerManager<C extends Composer> {
  constructor(
    readonly defaultComposer: C,
    readonly path: string,
    readonly steps: RepeatStep[],
  ) {}

  get canCompile(): boolean {
    const lastStep = this.steps.at(-1);

    if (!lastStep) return true;

    if (lastStep.type === "apply") return true;

    return lastStep.propertyType === "getter" ? true : false;
  }

  private addStepCache = new HashMap<RepeatStep, C>();

  addStep(step: RepeatStep): C {
    let childComposer = this.addStepCache.get(step);

    if (childComposer) {
      return childComposer;
    }

    childComposer = createThemedComposer(this.defaultComposer, this.path, [...this.steps, step]);

    this.addStepCache.set(step, childComposer);

    return childComposer;
  }

  private getComposerFromCallArg(propsOrTheme?: ThemeOrThemeProps): C {
    const theme = getThemeFromCallArg(propsOrTheme);

    if (!theme) {
      return this.defaultComposer;
    }

    if (!getIsThemeOrVariant(theme)) {
      throw new Error("Theme is not composable");
    }

    const maybeComposer = getThemeValueByPath(theme, this.path);

    if (!maybeComposer) {
      return this.defaultComposer;
    }

    if (!getIsComposer(maybeComposer)) {
      throw new Error("Theme value is not a composer");
    }

    return maybeComposer as C;
  }

  applyForProps(props: ThemeOrThemeProps): CompileResult {
    let composer = this.getComposerFromCallArg(props);

    composer = repeatStepsOnComposer(composer, this.steps);

    return composer.compile();
  }
}

export type ThemedValueGetter<V> = (props?: ThemeOrThemeProps) => V;

function createThemedValueGetter<T>(path: string, defaultValue: T): ThemedValueGetter<T> {
  return function getThemedValue(props?: ThemeOrThemeProps) {
    const theme = getThemeFromCallArg(props);

    if (!theme) {
      return defaultValue;
    }

    const themeValue = getThemeValueByPath(theme, path);

    if (themeValue === undefined) {
      return defaultValue;
    }

    return themeValue as T;
  };
}

export type ThemedValueInput = Primitive | Composer;

export type ThemedValue<V extends ThemedValueInput = ThemedValueInput> = V extends Primitive ? ThemedValueGetter<V> : V;

export function createThemedValue<V extends ThemedValueInput>(path: string, defaultValue: V): ThemedValue<V> {
  if (getIsComposer(defaultValue)) {
    return createThemedComposer(defaultValue, path, []) as ThemedValue<V>;
  }

  return createThemedValueGetter(path, defaultValue) as ThemedValue<V>;
}

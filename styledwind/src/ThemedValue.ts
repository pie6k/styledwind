import { CompileResult, Composer, ThemeOrThemeProps, getIsComposer } from "./Composer";
import { ThemeInput, ThemeOrVariant, getIsThemeOrVariant, getThemeValueByPath } from "./theme";

import { EqualKeyMap } from "./utils/map/EqualKeyMap";
import { Primitive } from "./utils/primitive";
import { memoizeFn } from "./utils/memoize";

interface ThemedComposerHolder<C extends Composer> {
  (propsOrTheme?: unknown): CompileResult;
  composer: C;
  manager: ThemedComposerManager<C>;
}

type RepeatStep =
  | {
      type: "get";
      property: string | symbol;
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
        result = Reflect.get(result as object, step.property, result);

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
  getters: string[];
  methods: string[];
}

const analytzePrototype = memoizeFn(
  (prototype: object) => {
    const result: AnalyzedPrototype = {
      getters: [],
      methods: [],
    };

    while (prototype) {
      if (!prototype || prototype === Object.prototype) {
        break;
      }

      const descriptors = Object.getOwnPropertyDescriptors(prototype);

      for (const key in descriptors) {
        const descriptor = descriptors[key];

        if (descriptor.get) {
          result.getters.push(key);
        } else if (typeof descriptor.value === "function") {
          result.methods.push(key);
        }
      }

      prototype = Object.getPrototypeOf(prototype);
    }

    return result;
  },
  { mode: "weak" },
);

const themedComposerHolderProxyHandler: ProxyHandler<ThemedComposerHolder<Composer>> = {
  get(holder, prop, receiver) {
    const prototypeInfo = analytzePrototype(holder.composer.composer);

    if (prototypeInfo.getters.includes(prop as string)) {
      return holder.manager.addStep({ type: "get", property: prop, propertyType: "getter" });
    }

    if (prototypeInfo.methods.includes(prop as string)) {
      return holder.manager.addStep({ type: "get", property: prop, propertyType: "method" });
    }

    return Reflect.get(holder.composer, prop, receiver);
  },
  apply(target, _thisArg, argArray) {
    if (target.manager.currentlyPointingAt === "method") {
      return target.manager.addStep({ type: "apply", args: argArray });
    }

    return target.manager.applyForProps(argArray[0]);
  },
};

const themedComposers = new WeakSet<object>();

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

function createHolder<C extends Composer>(themedComposer: C, manager: ThemedComposerManager<C>) {
  const holder: ThemedComposerHolder<C> = () => null;
  holder.composer = themedComposer.composer;
  holder.manager = manager;
  return holder;
}

export function getIsThemedComposer(value: unknown): value is Composer {
  return themedComposers.has(value as Composer);
}

class ThemedComposerManager<C extends Composer> {
  constructor(
    readonly defaultComposer: C,
    readonly path: string,
    readonly steps: RepeatStep[],
  ) {}

  get currentlyPointingAt(): "composer" | "method" {
    const lastStep = this.steps.at(-1);

    if (!lastStep) return "composer";

    if (lastStep.type === "apply") return "composer";

    return lastStep.propertyType === "getter" ? "composer" : "method";
  }

  private addStepCache = new EqualKeyMap<RepeatStep, ThemedComposerManager<C>>();

  addStep(step: RepeatStep): ThemedComposerManager<C> {
    let childComposer = this.addStepCache.get(step);

    if (childComposer) {
      return childComposer;
    }

    const manager = new ThemedComposerManager<C>(this.defaultComposer, this.path, this.steps.concat(step));

    const holder = createHolder<C>(this.defaultComposer, manager);

    childComposer = new Proxy(holder, themedComposerHolderProxyHandler) as unknown as ThemedComposerManager<C>;

    themedComposers.add(childComposer);

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

function createThemedComposerRoot<C extends Composer>(path: string, defaultComposer: C): C {
  const manager = new ThemedComposerManager<C>(defaultComposer, path, []);
  const holder = createHolder<C>(defaultComposer, manager);

  const themedComposer = new Proxy(holder, themedComposerHolderProxyHandler) as unknown as C;

  themedComposers.add(themedComposer);

  return themedComposer;
}

export type ThemedValueGetter<V> = (props?: ThemeOrThemeProps) => V;

function createThemedValueGetter<T>(path: string, defaultValue: T): ThemedValueGetter<T> {
  return function getThemedValue(props?: ThemeOrThemeProps) {
    const theme = getThemeFromCallArg(props);

    if (!theme) {
      return defaultValue;
    }

    const themeValue = getThemeValueByPath(theme, path);

    if (!themeValue) {
      return defaultValue;
    }

    return themeValue as T;
  };
}

export type ThemedValueInput = Primitive | Composer;

export type ThemedValue<V extends ThemedValueInput = ThemedValueInput> = V extends Primitive ? ThemedValueGetter<V> : V;

export function createThemedValue<V extends ThemedValueInput>(path: string, defaultValue: V): ThemedValue<V> {
  if (getIsComposer(defaultValue)) {
    return createThemedComposerRoot(path, defaultValue) as ThemedValue<V>;
  }

  return createThemedValueGetter(path, defaultValue) as ThemedValue<V>;
}

import { CompileResult, Composer, ThemeOrThemeProps, getIsComposer } from "./Composer";
import { Primitive, isPrimitive } from "./utils/primitive";
import { ThemeInput, ThemeOrVariant, getIsThemeOrVariant, getThemeValueByPath } from "./theme";

import { HashMap } from "./utils/map/HashMap";

interface ThemedComposerHolder<C extends Composer> {
  (propsOrTheme?: unknown): CompileResult;
  repeater: ComposerRepeater<C>;
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

function repeatStepsOnComposer<C extends Composer>(composer: C, steps: RepeatStep[]): C {
  let currentResult: unknown = composer;
  let currentComposer = currentResult;

  for (const step of steps) {
    if (!currentComposer) {
      throw new Error("Composer is not defined");
    }
    if (step.type === "get") {
      currentResult = (currentResult as Composer)[step.property as keyof Composer];

      if (step.propertyType === "getter") {
        currentResult = currentComposer = (currentResult as Composer).rawComposer;
      }
    } else if (step.type === "apply") {
      currentResult = (currentResult as Function).apply(currentComposer, step.args);
      currentResult = currentComposer = (currentResult as Composer).rawComposer;
    }
  }

  return currentResult as C;
}

interface AnalyzedPrototype {
  getters: Set<string>;
  methods: Set<string>;
}

function getPrototypeInfo(prototype: object): AnalyzedPrototype {
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
      if (key === "constructor") continue;

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
}

const IS_THEMED_COMPOSER = Symbol("isThemedComposer");

const themedComposerHolderProxyHandler: ProxyHandler<ThemedComposerHolder<Composer>> = {
  get(holder, prop) {
    const prototypeInfo = holder.repeater.info.prototypeInfo;

    if (prototypeInfo.methods.has(prop as string)) {
      return holder.repeater.addStep({ type: "get", property: prop as string, propertyType: "method" });
    }

    if (prototypeInfo.getters.has(prop as string)) {
      return holder.repeater.addStep({ type: "get", property: prop as string, propertyType: "getter" });
    }

    return holder.repeater.info.themeDefaultComposer[prop as keyof Composer];
  },
  apply(target, _thisArg, argArray) {
    if (!target.repeater.canCompile) {
      return target.repeater.addStep({ type: "apply", args: argArray });
    }

    return target.repeater.compileForProps(argArray[0]);
  },
  has(target, prop) {
    if (prop === IS_THEMED_COMPOSER) {
      return true;
    }

    return Reflect.has(target.repeater.info.themeDefaultComposer, prop);
  },
  set() {
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

function createRepeaterProxy<C extends Composer>(repeater: ComposerRepeater<C>) {
  const getThemedValue: ThemedComposerHolder<C> = () => null;
  getThemedValue.repeater = repeater;

  return new Proxy(getThemedValue, themedComposerHolderProxyHandler) as unknown as C;
}

function createRepeaterRoot<C extends Composer>(defaultComposer: C, path: string) {
  const repeater = new ComposerRepeater<C>(
    {
      themeDefaultComposer: defaultComposer,
      path,
      prototypeInfo: getPrototypeInfo(defaultComposer),
    },
    [],
  );

  return createRepeaterProxy(repeater);
}

interface ThemeComposerInfo<C extends Composer> {
  themeDefaultComposer: C;
  path: string;
  prototypeInfo: AnalyzedPrototype;
}

class ComposerRepeater<C extends Composer> {
  private addStepCache = new HashMap<RepeatStep, C>();
  private compileForComposerCache = new WeakMap<C, CompileResult>();

  constructor(
    readonly info: ThemeComposerInfo<C>,
    readonly steps: RepeatStep[],
  ) {}

  get canCompile(): boolean {
    const lastStep = this.steps.at(-1);

    if (!lastStep) return true;

    if (lastStep.type === "apply") return true;

    return lastStep.propertyType === "getter" ? true : false;
  }

  addStep(step: RepeatStep): C {
    let childComposer = this.addStepCache.get(step);

    if (childComposer) {
      return childComposer;
    }

    childComposer = createRepeaterProxy(new ComposerRepeater<C>(this.info, [...this.steps, step]));

    this.addStepCache.set(step, childComposer);

    return childComposer;
  }

  private getComposerFromCallArg(propsOrTheme?: ThemeOrThemeProps): C {
    const theme = getThemeFromCallArg(propsOrTheme);

    if (!theme) {
      return this.info.themeDefaultComposer;
    }

    if (!getIsThemeOrVariant(theme)) {
      throw new Error("Theme is not composable");
    }

    const maybeComposer = getThemeValueByPath(theme, this.info.path);

    if (!maybeComposer) {
      return this.info.themeDefaultComposer;
    }

    if (!getIsComposer(maybeComposer)) {
      throw new Error("Theme value is not a composer");
    }

    return maybeComposer as C;
  }

  compileForComposer(sourceComposer: C): CompileResult {
    let result = this.compileForComposerCache.get(sourceComposer);

    if (result !== undefined) {
      return result;
    }

    const finalComposer = repeatStepsOnComposer(sourceComposer, this.steps);

    if (!finalComposer) {
      throw new Error("Failed to get theme value.");
    }

    result = finalComposer.compile();

    this.compileForComposerCache.set(sourceComposer, result);

    return result;
  }

  compileForProps(props: ThemeOrThemeProps): CompileResult {
    let composer = this.getComposerFromCallArg(props);

    return this.compileForComposer(composer);
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
    return createRepeaterRoot(defaultValue, path) as ThemedValue<V>;
  }

  return createThemedValueGetter(path, defaultValue) as ThemedValue<V>;
}

import { JSONObject } from "./utils/json";

interface ComposerConfigOptions {
  cache?: boolean;
}

export class ComposerConfig<T = unknown> {
  constructor(
    readonly defaultConfig: T,
    readonly options: ComposerConfigOptions = { cache: true },
  ) {}
}

export function composerConfig<T>(defaultConfig: T) {
  return new ComposerConfig(defaultConfig);
}

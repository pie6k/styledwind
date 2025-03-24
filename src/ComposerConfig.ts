interface ComposerConfigOptions<T> {
  cache?: boolean;
}

export class ComposerConfig<T = unknown> {
  constructor(
    readonly defaultConfig: T,
    readonly options: ComposerConfigOptions<T> = { cache: true },
  ) {}
}

export function composerConfig<T>(defaultConfig: T) {
  return new ComposerConfig(defaultConfig);
}

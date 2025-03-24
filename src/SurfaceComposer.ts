import { FlexComposer } from "./FlexComposer";
import { composerConfig } from "./ComposerConfig";
import { memoizeFn } from "./utils/memoize";
import { resolveSizeValue } from "./SizeComposer";

interface SizingBoxConfig {
  px?: number;
  py?: number;
  radius?: number;
  height?: number;
  width?: number;
}

const config = composerConfig<SizingBoxConfig>({});

export class SurfaceComposer extends FlexComposer {
  getStyles() {
    return null;
  }

  define(value: SizingBoxConfig) {
    return this.updateConfig(config, value as Partial<SizingBoxConfig>);
  }

  get padding() {
    const { px = 0, py = 0 } = this.getConfig(config);

    return this.addStyle({
      paddingLeft: resolveSizeValue(px),
      paddingRight: resolveSizeValue(px),
      paddingTop: resolveSizeValue(py),
      paddingBottom: resolveSizeValue(py),
    });
  }

  get paddingX() {
    const { px = 0 } = this.getConfig(config);

    return this.addStyle({
      paddingLeft: resolveSizeValue(px),
      paddingRight: resolveSizeValue(px),
    });
  }

  get paddingY() {
    const { py = 0 } = this.getConfig(config);

    return this.addStyle({
      paddingTop: resolveSizeValue(py),
      paddingBottom: resolveSizeValue(py),
    });
  }

  get radius() {
    const { radius = 0 } = this.getConfig(config);

    return this.addStyle({ borderRadius: resolveSizeValue(radius) });
  }

  get height() {
    const { height = 0 } = this.getConfig(config);

    return this.addStyle({ height: resolveSizeValue(height) });
  }

  get width() {
    const { width = 0 } = this.getConfig(config);

    return this.addStyle({ width: resolveSizeValue(width) });
  }

  get circle() {
    return this.define({ radius: 1000 });
  }

  get size() {
    const { height = 0, width = 0 } = this.getConfig(config);

    return this.addStyle({ height: resolveSizeValue(height), width: resolveSizeValue(width) });
  }

  get noPT() {
    return this.addStyle({ paddingTop: 0 });
  }

  get noPB() {
    return this.addStyle({ paddingBottom: 0 });
  }

  get noPL() {
    return this.addStyle({ paddingLeft: 0 });
  }

  get noPR() {
    return this.addStyle({ paddingRight: 0 });
  }
}

export const surface = memoizeFn(
  function surface(config: SizingBoxConfig) {
    return new SurfaceComposer().define(config).init();
  },
  { mode: "equal" },
);

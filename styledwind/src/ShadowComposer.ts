import { Composer } from "./Composer";
import { ComposerConfig } from "./ComposerConfig";
import { getHasValue } from "./utils/maybeValue";
import { setColorOpacity } from "./utils/color";

interface ShadowConfig {
  x?: number;
  y?: number;
  blur?: number;
  color?: string;
  inset?: boolean;
  spread?: number;
}

const shadowConfig = new ComposerConfig<ShadowConfig>({});

export class ShadowComposer extends Composer {
  x(value: number) {
    return this.updateConfig(shadowConfig, { x: value });
  }

  y(value: number) {
    return this.updateConfig(shadowConfig, { y: value });
  }

  blur(value: number) {
    return this.updateConfig(shadowConfig, { blur: value });
  }

  color(value: string) {
    return this.updateConfig(shadowConfig, { color: value });
  }

  inset(value: boolean) {
    return this.updateConfig(shadowConfig, { inset: value });
  }

  spread(value: number) {
    return this.updateConfig(shadowConfig, { spread: value });
  }

  opacity(value: number) {
    const color = this.getConfig(shadowConfig).color;

    if (!color) {
      console.warn("To set shadow opacity, you must first set a color");
      return this;
    }

    return this.updateConfig(shadowConfig, { color: setColorOpacity(color, value) });
  }

  compile() {
    if (getHasValue(this.compileCache)) return this.compileCache;

    const { x, y, blur, color, inset, spread } = this.getConfig(shadowConfig);

    const shadowStyle = `box-shadow: ${x}px ${y}px ${blur}px ${spread}px ${color} ${inset ? "inset" : ""};`;

    return super.compile(shadowStyle);
  }
}

export const shadow = new ShadowComposer().init();

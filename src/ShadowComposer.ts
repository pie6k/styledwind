import { StylesComposer } from "./StylesComposer";
import { setColorOpacity } from "./utils/color";

interface ShadowConfig {
  x?: number;
  y?: number;
  blur?: number;
  color?: string;
  inset?: boolean;
  spread?: number;
}

function getShadowStyles(config: ShadowConfig): string {
  let { x = 0, y = 0, blur = 0, color, inset = false, spread = 0 } = config;

  if (!color) return "";

  return `box-shadow: ${x}px ${y}px ${blur}px ${spread}px ${color} ${inset ? "inset" : ""};`;
}

export class ShadowComposer extends StylesComposer<ShadowConfig> {
  constructor(config?: ShadowConfig) {
    super(config ?? {});
  }

  x(value: number) {
    return this.updateConfig({ x: value });
  }

  y(value: number) {
    return this.updateConfig({ y: value });
  }

  blur(value: number) {
    return this.updateConfig({ blur: value });
  }

  color(value: string) {
    return this.updateConfig({ color: value });
  }

  inset(value: boolean) {
    return this.updateConfig({ inset: value });
  }

  spread(value: number) {
    return this.updateConfig({ spread: value });
  }

  opacity(value: number) {
    if (!this.config.color) {
      console.warn("To set shadow opacity, you must first set a color");
      return this;
    }

    return this.updateConfig({ color: setColorOpacity(this.config.color, value) });
  }

  getStyles() {
    return getShadowStyles(this.config);
  }
}

export const shadow = new ShadowComposer().start();

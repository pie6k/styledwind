import * as sw from "@";

import { color, createTheme, createThemeVariant, flex } from "@";

Reflect.set(window, "sw", sw);

console.time("flex");

for (let i = 0; i < 10000; i++) {
  flex.vertical.gap(2).alignCenter.justifyAround();
}

console.timeEnd("flex");

const theme = createTheme({
  color: color({ color: "red" }),
});

const variant = createThemeVariant(theme, {
  color: color({ color: "blue" }),
});

console.time("theme");

for (let i = 0; i < 10000; i++) {
  theme.color.opacity(0.5).withBorder.asOutline.asBg(variant);
}

console.timeEnd("theme");

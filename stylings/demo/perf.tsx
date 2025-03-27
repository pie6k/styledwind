import * as sw from "@";

import { $color, $flex, createTheme, createThemeVariant } from "@";

Reflect.set(window, "sw", sw);

console.time("first");

$flex.vertical.gap(2).alignCenter.justifyAround();
$flex.vertical.gap(3).alignCenter.justifyAround();
$flex.vertical.gap(4).alignCenter.justifyAround();
$flex.vertical.gap(5).alignCenter.justifyAround();
$flex.vertical.gap(6).alignCenter.justifyAround();
$flex.vertical.gap(7).alignCenter.justifyAround();
$flex.vertical.gap(8).alignCenter.justifyAround();
$flex.vertical.gap(9).alignCenter.justifyAround();
$flex.vertical.gap(10).alignCenter.justifyAround();

console.timeEnd("first");

console.time("cached");

$flex.vertical.gap(2).alignCenter.justifyAround();
$flex.vertical.gap(3).alignCenter.justifyAround();
$flex.vertical.gap(4).alignCenter.justifyAround();
$flex.vertical.gap(5).alignCenter.justifyAround();
$flex.vertical.gap(6).alignCenter.justifyAround();
$flex.vertical.gap(7).alignCenter.justifyAround();
$flex.vertical.gap(8).alignCenter.justifyAround();
$flex.vertical.gap(9).alignCenter.justifyAround();
$flex.vertical.gap(10).alignCenter.justifyAround();

console.timeEnd("cached");

console.time("flex");

const color = $color({ color: "red" });

for (let i = 0; i < 10000; i++) {
  // $flex.gap(i).vertical.alignCenter.justifyAround();
  // color.opacity(0.5).withBorder.asOutline.asBg();
  // color.opacity(0.5).withBorder.asOutline.asBg();
  // color.opacity(0.5).withBorder.asOutline.asBg();
  // color.opacity(0.5).withBorder.asOutline.asBg();
  // color.opacity(0.5).withBorder.asOutline.asBg();
}

console.timeEnd("flex");

const theme = createTheme({
  color: $color({ color: "red" }),
});

const variant = createThemeVariant(theme, {
  color: $color({ color: "blue" }),
});

const themedFlex = createTheme({
  $flex,
});

console.time("theme");

for (let i = 0; i < 100000; i++) {
  themedFlex.$flex.gap(i).vertical.alignCenter.justifyAround(variant);
  // theme.color.opacity(0.5).withBorder.asOutline.asBg(variant);
  // theme.color.opacity(0.5).withBorder.asOutline.asBg(variant);
  // theme.color.opacity(0.5).withBorder.asOutline.asBg(variant);
  // theme.color.opacity(0.5).withBorder.asOutline.asBg(variant);
  // theme.color.opacity(0.5).withBorder.asOutline.asBg(variant);
}

console.timeEnd("theme");

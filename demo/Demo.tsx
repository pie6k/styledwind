import { UI, animation, flex } from "@";

export function Demo() {
  console.log(flex.vertical.gap(2).align("center"));
  return <UI.Box_h2 styles={[flex.vertical.gap(2), animation.fadeIn]}>Hello, world!</UI.Box_h2>;
}

import { $animation, $flex, $font, UI } from "@";

import { styled } from "styled-components";

export function Demo() {
  return (
    <UI.Box_h2 styles={[$flex.vertical.gap(1), $animation.fadeIn.slideUpFromBottom(10).fillMode("both")]}>
      <UIContent>Hello, world!</UIContent>
      <UIContent>Hello, world!</UIContent>
    </UI.Box_h2>
  );
}

const text = $font.family("Inter, sans-serif").lineHeight(1.5).antialiased;

const UIContent = styled.div`
  ${text};
  ${$flex.vertical.gap(2).horizontal.alignCenter.alignEnd.gap()};
`;

for (let i = 0; i < 10000; i++) {
  $flex.vertical.gap(2).horizontal.alignCenter.alignEnd.gap(4)();
}

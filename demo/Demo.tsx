import { UI, animation, flex, font } from "@";

import { styled } from "styled-components";

export function Demo() {
  return (
    <UI.Box_h2 styles={[flex.vertical.gap(2), animation.fadeIn.fillMode("both")]}>
      <UIContent>Hello, world!</UIContent>
    </UI.Box_h2>
  );
}

const text = font.family("Inter, sans-serif").lineHeight(1.5).antialiased;

const UIContent = styled.div`
  ${text};
`;

for (let i = 0; i < 10000; i++) {
  flex.vertical.gap(2).horizontal.alignCenter.alignEnd.gap(4)();
}

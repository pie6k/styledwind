import * as sw from "@";

import { $flex, createTheme } from "@";

Reflect.set(window, "sw", sw);

const { $flex: themedFlex } = createTheme({
  $flex,
});

themedFlex.gap(2).vertical.alignCenter.justifyAround();

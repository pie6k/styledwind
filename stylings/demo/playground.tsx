import * as sw from "@";

import { $flex } from "@";

console.log($flex.vertical.gap(2)());

Reflect.set(window, "sw", sw);

import { flex } from "@";

console.time("test");

for (let i = 0; i < 10000; i++) {
  flex.vertical
    .gap(2)
    .horizontal.alignCenter.alignEnd.gap(4)
    .addStyle({ display: "flex" })
    .addStyle({ display: "flex" })
    .addStyle({ display: "flex" })
    .addStyle({ display: "flex" })
    .addStyle({ display: "flex" })
    .addStyle({ display: "flex" })();
}

console.timeEnd("test");

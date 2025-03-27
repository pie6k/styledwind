import { describe, expect, test } from "vitest";

import { getObjectHash } from "@/utils/objectHash";

const hash = getObjectHash;

class Foo {}

describe("hash", () => {
  test("basic", () => {
    expect(hash({ a: 1 })).toBe(hash({ a: 1 }));
    expect(hash({ a: 1 })).not.toBe(hash({ a: 2 }));
    expect(hash({ a: 1 })).not.toBe(hash({ b: 1 }));
    expect(hash({ a: 1 })).not.toBe(hash({ a: 1, b: 2 }));

    const foo = new Foo();
    const bar = new Foo();

    expect(hash(foo)).toBe(hash(foo));
    expect(hash({ foo })).toBe(hash({ foo }));
    expect(hash({ foo })).not.toBe(hash({ bar }));
    expect(hash({ foo })).not.toBe(hash({ foo: bar }));

    expect(hash({})).not.toBe(hash(null));
    expect(hash(null)).not.toBe(hash(undefined));

    expect(hash([foo])).toBe(hash([foo]));
    expect(hash([foo])).not.toBe(hash([bar]));
    expect(hash([foo, foo])).not.toBe(hash([foo, bar]));
    expect(hash([foo, foo])).toBe(hash([foo, foo]));
  });
});

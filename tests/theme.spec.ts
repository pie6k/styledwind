import {
  color,
  createTheme,
  createThemeVariant,
  font,
  getIsTheme,
  getIsThemeOrVariant,
  getIsThemeVariant,
  getIsThemedComposer,
} from "@";
import { describe, expect, test } from "vitest";

const theme = createTheme({
  foo: 42,
  typo: {
    base: font.size("1rem"),
  },
  colors: {
    primary: color({ color: "red" }),
  },
});

const blue = createThemeVariant(theme, {
  foo: 43,
  colors: {
    primary: color({ color: "blue" }),
  },
});

describe("theme", () => {
  test("detect theme and variant", () => {
    expect(getIsThemeOrVariant(theme)).toBe(true);
    expect(getIsThemeOrVariant(blue)).toBe(true);

    expect(getIsTheme(theme)).toBe(true);
    expect(getIsThemeVariant(theme)).toBe(false);

    expect(getIsThemeVariant(blue)).toBe(true);
    expect(getIsTheme(blue)).toBe(false);

    expect(getIsTheme(null)).toBe(false);
    expect(getIsThemeVariant(null)).toBe(false);
  });

  test("converts composers to themed composers", () => {
    expect(getIsThemedComposer(theme.typo.base)).toBe(true);
    expect(getIsThemedComposer(theme.colors.primary)).toBe(true);
  });

  test("chaining keeps composers as themed", () => {
    expect(getIsThemedComposer(theme.typo.base.underline.capitalize)).toBe(true);
  });

  test("creating variant is not allowed on non theme", () => {
    expect(() => {
      // @ts-expect-error
      createThemeVariant(blue, {});
    }).toThrowErrorMatchingInlineSnapshot(`[Error: Can only create theme variant from source theme]`);
  });

  test("primitive values are returned basing on theme", () => {
    expect(theme.foo()).toBe(42);

    expect(theme.foo(theme)).toBe(42);
    expect(theme.foo(blue)).toBe(43);

    expect(theme.foo({ theme })).toBe(42);
    expect(theme.foo({ theme: blue })).toBe(43);

    expect(theme.foo({ theme: undefined })).toBe(42);
  });

  test("correctly return theme variant for proper call", () => {
    expect(theme.colors.primary({ theme })).toMatchInlineSnapshot(`
      [
        "red",
      ]
    `);

    expect(theme.colors.primary({ theme: blue })).toMatchInlineSnapshot(`
      [
        "blue",
      ]
    `);
  });

  test("correctly return default theme variant for call without theme", () => {
    expect(theme.colors.primary()).toMatchInlineSnapshot(`
      [
        "red",
      ]
    `);

    expect(theme.colors.primary.asBg()).toMatchInlineSnapshot(`
      [
        "background-color: red; --background-color: red;",
      ]
    `);
  });

  test("correctly return theme chained value for props call", () => {
    expect(theme.colors.primary.asBg({ theme })).toMatchInlineSnapshot(`
      [
        "background-color: red; --background-color: red;",
      ]
    `);

    expect(theme.colors.primary.asBg({ theme: blue })).toMatchInlineSnapshot(`
      [
        "background-color: blue; --background-color: blue;",
      ]
    `);
  });

  test("correctly return theme chained value for theme", () => {
    expect(theme.colors.primary.asBg(theme)).toMatchInlineSnapshot(`
      [
        "background-color: red; --background-color: red;",
      ]
    `);

    expect(theme.colors.primary.asBg(blue)).toMatchInlineSnapshot(`
      [
        "background-color: blue; --background-color: blue;",
      ]
    `);
  });

  test("correctly passes arguments to themed composers", () => {
    expect(theme.colors.primary.opacity(0.5).asBg(theme)).toMatchInlineSnapshot(`
      [
        "background-color: hsla(0, 100%, 50%, 0.5); --background-color: hsla(0, 100%, 50%, 0.5);",
      ]
    `);

    expect(theme.colors.primary.opacity(0.5).asBg(blue)).toMatchInlineSnapshot(`
      [
        "background-color: hsla(240, 100%, 50%, 0.5); --background-color: hsla(240, 100%, 50%, 0.5);",
      ]
    `);
  });

  test("uses default theme if no theme is provided", () => {
    expect(theme.colors.primary.asBg({ theme: undefined })).toMatchInlineSnapshot(`
      [
        "background-color: red; --background-color: red;",
      ]
    `);
  });

  test("throws error if theme is not composable", () => {
    expect(() => theme.colors.primary.asBg({ theme: {} })).toThrowErrorMatchingInlineSnapshot(
      `[Error: There is some value provided as theme in props, but it is has unknown type]`,
    );
  });

  test("returns value from original theme if variant does not change it", () => {
    expect(theme.typo.base({ theme: blue })).toMatchInlineSnapshot(`
      [
        "font-size: 1rem;",
      ]
    `);

    expect(theme.typo.base.underline({ theme: blue })).toMatchInlineSnapshot(`
      [
        "font-size: 1rem;",
        "text-decoration: underline;",
      ]
    `);
  });

  test("will throw if theme exits composable context", () => {
    const theme = createTheme({
      color: color({ color: "red" }),
    });

    expect(() => {
      // @ts-expect-error
      theme.color.compile()();
    }).toThrowErrorMatchingInlineSnapshot(
      `[Error: Themed composer called a method that did not return a composer (compile)]`,
    );
  });

  test("cache", () => {
    expect(theme.colors.primary).toBe(theme.colors.primary);

    expect(theme.colors.primary.hover).toBe(theme.colors.primary.hover);

    expect(theme.colors.primary.hover.asBg.asOutline).toBe(theme.colors.primary.hover.asBg.asOutline);

    expect(theme.colors.primary.hover.asBg.asOutline()).toBe(theme.colors.primary.hover.asBg.asOutline());

    expect(theme.colors.primary.hover({ theme })).toBe(theme.colors.primary.hover({ theme }));

    expect(theme.colors.primary.hover({ theme: blue })).toBe(theme.colors.primary.hover({ theme: blue }));

    expect(theme.colors.primary.hover(theme)).toBe(theme.colors.primary.hover(theme));

    expect(theme.colors.primary.hover(blue)).toBe(theme.colors.primary.hover(blue));

    expect(theme.colors.primary.hover()).toBe(theme.colors.primary.hover());

    expect(theme.colors.primary.opacity(0.5).hover()).toBe(theme.colors.primary.opacity(0.5).hover());

    expect(
      //
      theme.colors.primary.addStyle({ accentColor: "red" }).hover(),
    ).toBe(
      //
      theme.colors.primary.addStyle({ accentColor: "red" }).hover(),
    );
  });
});

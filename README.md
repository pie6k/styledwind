# Styledwind

Styledwind is an opinionated and joyful library helping you write semantic, composable, reusable styles using `React` and `styled-components`.

It is battle tested and used in production in [Screen Studio](https://screen.studio).

If you want to see examples, scroll down to the [Examples](#examples) section.

# Installation

```bash
yarn install styledwind
# or
npm install styledwind
# or
pnpm install styledwind
```

# Goals & Motivation

- Joyful & productive developer experience
- Easy to keep a consistent design language
- Allow rapid iterations over UI code
- Semantic styling - aka. code should not only describe how something looks, but also what it is
- Good debugging experience in devtools
- Make opinionated and automated choices on common styling patterns
- Simple, chainable, composable API that is enjoyable to use
- Automate some styling tasks (eg. generate hover color variants)

# Examples

## Composing styles inside styled-components

```tsx
import styled from "styled-components";
import { flex, animation } from "styledwind";

function App() {
  return <UICard>Card</UICard>;
}

const UICard = styled.div`
  ${flex.horizontal.alignCenter.gap(2)};

  /* Fade in animation */
  ${animation.properties({ opacity: [0, 1] }).duration("100ms")};
`;
```

This is a simple example, where `styledwind` helps to quickly define a style for the `UICard` component.

## Composable, reusable styles

```tsx
// We define some shared font styles
const baseFont = font.family("Inter, sans-serif").lineHeight(1.5).antialiased;

export const typo = {
  // And compose them into more specific styles
  header: baseFont.size("2rem").lineHeight(1.25).bold,
  copy: baseFont,
  label: baseFont.size("0.875rem"),
};

// We define common rules for our animations (duration, easing)
const baseAnimation = animation.duration("150ms").easeInOut;

export const animations = {
  // And compose it into specific animations
  fadeIn: baseAnimation.properties({ opacity: [0, 1] }),
  slideUp: baseAnimation.properties({ y: [10, 0] }),
};

// Or continue composing inside components
const UILink = styled.a`
  ${typo.copy.underline};
`;

const UIQuote = styled.blockquote`
  ${typo.copy.italic};
  ${animations.slideUp.duration("500ms")};
`;
```

## Creating inline, semantic styles

Often we don't want to define each part of the style as a separate component outside of our React component. Either when some styled part is simple, or when we rapidly iterate.

We can do it inline, while next to the styles, still giving each part a semantic name and meaning (that will also be visible in devtools).

```tsx
import { UI, flex, font, box } from "styledwind";

function Form() {
  return (
    {/* You can dynamically use `UI.AnyNameYouWant` */}
    <UI.FormHolder styles={[flex.vertical.gap(3), animations.fadeIn]}>
      {/* If name ends with eg "_h1", the result will be <h1> tag, etc */}
      <UI.FormHeader_h1 styles={typo.header}>Form</UI.FormHeader_h1>
      <UI.FormIntro_p styles={typo.copy.secondary}>
        Intro here
      </UI.FormIntro_p>
      <UI.FormBody styles={flex.vertical.gap(2)}>
        {/* ... */}
        {/* ... */}
      </UI.FormBody>
    </UI.FormHolder>
  );
}
```

- For custom tags, eg `UI.Foo_h2`, Typescript will infer the correct type. Eg for `ref` it will be `RefObject<HTMLHeadingElement>`.

# Theme System

Styledwind provides a powerful theming system that allows you to create and manage theme variants while maintaining type safety and performance.

## Creating Themes

Themes are created using the `createTheme` function. It takes an object where you can pass composable and primitive values.

```tsx
import { createTheme, color, font } from "styledwind";

const baseFont = font.family("Inter, sans-serif").lineHeight(1.5).antialiased;

const theme = createTheme({
  // Primitive values
  spacing: 16,

  // Typography styles
  typo: {
    base: baseFont,
    header: baseFont.size("2rem").bold,
  },

  // Color styles
  colors: {
    primary: color({ color: "red" }),
    text: color({ color: "black" }),
    background: color({ color: "white" }),
  },
});
```

## Theme Variants

You can then create theme variants that inherit from a source theme but override specific values:

```tsx
import { createThemeVariant } from "styledwind";

const darkTheme = createThemeVariant(theme, {
  // Note: we can only pass values that we want to override. Everything else will be taken from the source theme.
  colors: {
    text: color({ color: "white" }),
    background: color({ color: "black" }),
  },
});
```

## Using Themes

To use theme, you simply read values from the theme object created before.

```tsx
import { theme } from "./theme";

function Card() {
  return (
    <UI.Card styles={theme.colors.background.readableText.asBg}>
      <UI.CardHeader_h1 styles={theme.typo.header} />
      <UI.CardBody styles={flex.vertical.gap(2)}>Card content</UI.CardBody>
    </UI.Card>
  );
}

// Or

const UICard = styled.div`
  ${theme.colors.background.readableText.asBg};
`;
```

## Theme provider

To use the theme, you need to wrap your app in the `ThemeProvider` component.

```tsx
import { ThemeProvider } from "styledwind";
import { theme, darkTheme } from "./theme";

function App() {
  const [currentTheme, setCurrentTheme] = useState(theme);

  function setLightTheme() {
    setCurrentTheme(theme);
  }

  function setDarkTheme() {
    setCurrentTheme(darkTheme);
  }

  return (
    <ThemeProvider theme={theme}>
      <App onSetLightTheme={setLightTheme} onSetDarkTheme={setDarkTheme} />
    </ThemeProvider>
  );
}
```

## Reading theme values

If your theme defines some primitive values, you can read them using `useThemeValue` hook.

```tsx
import { useThemeValue, createTheme } from "styledwind";

// theme.ts
const theme = createTheme({
  footerColumns: 3,
});

const wideTheme = createThemeVariant(theme, {
  footerColumns: 4,
});

// Footer.tsx
function Footer() {
  const footerColumns = useThemeValue(theme.footerColumns);
  return <div style={{ gridTemplateColumns: `repeat(${footerColumns}, 1fr)` }}>Hello</div>;
}
```

Optionally, anywhere (even outside of React) you can read theme values by calling theme values with `theme` argument.

```ts
const footerColumns = theme.footerColumns(theme); // 3
const wideFooterColumns = theme.footerColumns(wideTheme); // 4
```

Note: All the code above is fully typed and will give you autocomplete and type safety.

# Core concepts

## Colors

Stylewind is semi-opinionated about how we define and work with colors.

Every color is defined together with its 'hover', 'active' and 'readable text' variants.

> [!NOTE]
> If color variants are not defined, stylewind will automatically generate them for you.

```ts
const dangerColor = color({
  color: "rgb(255, 0, 0)",
  hover: "rgb(180, 0, 0)", // Optional
  active: "rgb(140, 0, 0)", // Optional
  readableText: "rgb(255, 255, 255)", // Optional
});
```

Later on, we can use it like this:

```tsx
// "static" example - it simply uses the color as background
const UIDangerText = styled.button`
  ${dangerColor.asColor};
`;

// "dynamic" example - it automatically generates &:hover and &:active styles
const UIDangerButton = styled.button`
  ${dangerColor.interactive.asBg};
`;
```

Use `.asColor`, `.asBg`, `.asFill` to decide how the color will be applied.

If you use none of those, color will be simply pasted as is, eg.

```tsx
const UIDangerText = styled.button`
  // color will be directly used
  --my-custom-variable: ${dangerColor};

  // color get 'active' variant, then lighten it even more and pass it directly to the variable
  --my-custom-highlight-variable: ${dangerColor.active.lighten(0.2)};
`;
```

Colors have plenty of methods to make working with them easier.

```ts
import { UI } from "styledwind";
import { dangerColor } from "./colors";

const subtleDangerColor = dangerColor.opacity(0.4).lighten(0.2);

function Notice() {
  return <UI.Notice styles={subtleDangerColor.asColor}>Notice</UI.Notice>;
}
```

> [!NOTE]
> It doesn't matter if you use chainable methods inside the component body or not. They are all cached. If the same modifiers are used multiple times across your app, they will be cached and reused.

```tsx
const subtleDangerColor = dangerColor.opacity(0.4).lighten(0.2);
const subtleDangerColor2 = dangerColor.opacity(0.4).lighten(0.2);

// subtleDangerColor and subtleDangerColor2 are the same
subtleDangerColor === subtleDangerColor2; // true
```

## Typography

To work with typography, we can use the `font` object. It provides a comprehensive set of properties to create and reuse typography styles.

```ts
import { font } from "styledwind";

// Basic typography composition. We define core, shared styles which we will later compose into more specific styles.
const baseText = font.family("Inter, sans-serif").size("1rem").lineHeight(1.5).antialiased;

// Heading styles - we use baseText as a starting point and compose more specific styles from it.
const heading = baseText.size("2rem").weight(700).lineHeight(1.25);

// Label styles - we use baseText as a starting point and compose more specific styles from it.
const label = baseText.size("0.875rem").opacity(0.7);
```

Each of the styles can then be used in our components or customized further.

```tsx
const UISmallLink = styled.a`
  ${label.underline};
`;

const UIHeroHeader = styled.h1`
  ${heading.uppercase.center};
`;

// Or inline
function App() {
  return <UI.UIDangerLink styles={[label.underline, dangerColor.interactive.asColor]}>Read more</UI.UIDangerLink>;
}
```

You can group your typography styles into a single object and reuse it across your app.

From JavaScript perspective, those styles are just objects, so you can export or group them as you want.

```ts
export const typo = {
  base: baseText,
  heading: heading,
  label: label,
};
```

## Surface

`surface` object allows defining shared styles such as `padding`, `border-radius`, etc.

In many apps multiple components use similar sizing styles, eg. input and button will share size, padding and border-radius.

```ts
import { surface } from "styledwind";

// Control will be used for inputs, buttons, select, etc
const control = sizing({
  paddingX: 2,
  paddingY: 2,
  height: 8,
  radius: 1,
});
```

> [!NOTE]
> If values are passed as numbers, they will use the same units as Tailwind CSS - 1 unit = 0.25rem.

And then we can use it in our components:

```tsx
const UIInput = styled.input`
  ${control.paddingX.minHeight.radius};
`;

const UITextarea = styled.textarea`
  ${control.padding.radius};
  min-height: 100px;
`;

const UISelect = styled.select`
  ${control.paddingX.minHeight.radius};
`;
```

We took the control object and declared which parts of it we want to apply

## Gaps

`flex` and `grid` have `.gap(gapLevel)` modifier.

Gap level increases spacing exponentially, not linearly.

```ts
flex.gap(1); // gap: 0.5rem;
flex.gap(2); // gap: 1rem;
flex.gap(3); // gap: 2rem;
flex.gap(4); // gap: 4rem;
flex.gap(5); // gap: 8rem;

flex.gap(); // same as .gap(1)
// etc.
```

I believe this is a more intuitive way to handle gaps, as in information hierarchy, more important groups usually have 2x more spacing than their child groups.

Also, I believe it results in more consistent spacing across the app, as you have 'less' options to intuitively choose from.

> [!NOTE]
> Gap is calculated using formula: `Math.pow(2, level) * 0.25rem`.

If you want, you can pass exact values as well.

```ts
flex.gap("4px"); // gap: 4px;
flex.gap("1em"); // gap: 1em;
// etc.
```

# Advanced

## Creating custom composable styles

You can create your own composable styles by extending the `Composer` class.

Let's say you want to create a custom `DropDownStylesComposer` composer that will be used to style dropdowns.

```ts
import { Composer } from "styledwind";

export class DropDownStylesComposer extends Composer {
  get shadow() {
    return this.addStyle({ boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)" });
  }

  get base() {
    return this.addStyle({
      padding: "1rem",
      borderRadius: "0.5rem",
    });
  }

  get border() {
    return this.addStyle({
      border: "1px solid #e0e0e0",
    });
  }

  get background() {
    return this.addStyle({
      background: "white",
    });

    // or
    return this.addStyle(theme.colors.dropdown.asBg);
  }

  get all() {
    return this.shadow.base.border.background;
  }
}

export const dropdown = new DropDownStylesComposer().init();
```

Now you can use it in your components:

```tsx
const UIDropDown = styled.div`
  ${dropdown.shadow.base.border.background};
  // or
  ${dropdown.all};
`;
```

> [!NOTE] > `.init()` call is only needed for TypeScript, as otherwise styled-components will complain about incorrect object passed inside `styled` tag.

## Custom composables with config

In some cases, you might want your composables to have some config before emmiting styles.

For example, you want to create a `ButtonStylesComposer` that will be used to style buttons.

```ts
import { Composer, composerConfig, CSSProperties } from "styledwind";

interface ButtonStylesConfig {
  size: "regular" | "small" | "medium" | "large";
  kind: "primary" | "secondary" | "tertiary";
}

const config = composerConfig<ButtonStylesConfig>({
  size: "regular",
  kind: "primary",
});

export class ButtonStylesComposer extends Composer {
  setSize(size: ButtonStylesConfig["size"]) {
    return this.setConfig(config, { size });
  }

  get regular() {
    return this.setSize("regular");
  }

  get small() {
    return this.setSize("small");
  }

  get medium() {
    return this.setSize("medium");
  }

  get large() {
    return this.setSize("large");
  }

  get primary() {
    return this.setKind("primary");
  }

  get secondary() {
    return this.setKind("secondary");
  }

  get tertiary() {
    return this.setKind("tertiary");
  }

  setKind(kind: ButtonStylesConfig["kind"]) {
    return this.setConfig(config, { kind });
  }

  private getButtonPropertiesForSize(size: ButtonStylesConfig["size"]): CSSProperties {
    // Use some utility functions to get the values
    const fontSize = getFontSizeForButtonSize(size);
    const paddingX = getPaddingXForButtonSize(size);
    const paddingY = getPaddingYForButtonSize(size);
    const minHeight = getMinHeightForButtonSize(size);

    return {
      fontSize,
      padding: `${paddingY} ${paddingX}`,
      minHeight,
    };
  }

  compile() {
    const { size, kind } = this.getConfig(config);

    return super.compile([
      // Generate all styles based on config
      this.getButtonPropertiesForSize(size),
      // You can pass more styles as well:
      // - CSSProperties,
      // - string, RuleSet (css``), Composer>)
    ]);
  }
}

export const button = new ButtonStylesComposer().init();
```

And later we can use it like this:

```tsx
const UIGetStartedButton = styled.button`
  ${button.regular.primary};
`;
```

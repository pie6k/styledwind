# Styledwind

Styledwind is an opinionated and joyful library helping you write semantic, composable, reusable styles using `React` and `styled-components`.

It is battle tested and used in production in [Screen Studio](https://screen.studio).

If you want to see examples, scroll down to the [Examples](#examples) section.

# Installation

```bash
yarn install styledwind
npm install styledwind
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

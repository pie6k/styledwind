# stylings

`stylings` is an opinionated and joyful library that helps you write semantic, composable, reusable styles using `React` and `styled-components`.

It is battle-tested and used in production at [Screen Studio](https://screen.studio).

Docs - [stylings.dev](https://stylings.dev).

## Goals & Motivation

- Joyful and productive developer experience
- Easy to maintain a consistent design language
- Allows rapid iterations over UI code
- Semantic styling - i.e., code should not only describe how something looks, but also what it is
- Good debugging experience in devtools
- Makes opinionated and automated choices on common styling patterns
- Simple, chainable, composable API that is enjoyable to use
- Automate some styling tasks (e.g., generate hover color variants)

## Installation

```sh
npm i stylings
# or
yarn add stylings
```

## Quick Start

### Compose your first styles

```tsx
import { $flex, $animation } from "stylings";

// Compose styles using chainable API
$flex.horizontal.alignCenter.gap(2);

// Create reusable styles and organize them how you like
const animations = {
  $fadeIn: $animation.properties({ opacity: [0, 1] }).duration("100ms").easeInOut,
};
```

### Use with styled-components

```tsx
import styled from "styled-components";
import { $flex } from "stylings";
import { animations } from "./styles";

const Intro = styled.div`
  ${animations.$fadeIn};
  ${$flex.horizontal.alignCenter.gap(2)};
`;

function App() {
  return <Intro>Hello World</Intro>;
}
```

### Use with inline components

```tsx
import { UI, $flex } from "stylings";
import { animations } from "./styles";

function App() {
  return <UI.MyAppIntro styles={[animations.$fadeIn, $flex.horizontal.alignCenter.gap(2)]}>Hello World</UI.MyAppIntro>;
}
```

## Core Features

### Style Composers

At the core of `stylings` are style composers. These are objects that collect desired styles and can be used to generate CSS. The main built-in composers are:

- `$flex` - for flexbox layouts
- `$grid` - for grid layouts
- `$animation` - for animations
- `$colors` - for color management
- `$frame` - for consistent UI element shapes
- `$font` - for typography
- `$shadow` - for box shadows
- `$common` - for common styles
- `$transition` - for transitions

### Working with Colors

```tsx
import { $color } from "stylings";

// Define a color
const $primary = $color("#048");

// Use it in styles
const Button = styled.button`
  ${$primary.interactive.asBg}; // Interactive adds hover states
`;
```

### Frame System

The Frame system helps maintain consistent sizing and spacing across UI elements:

```tsx
import { $frame } from "stylings";

const $control = $frame({
  height: 8,
  paddingX: 2,
  paddingY: 1,
  radius: 1,
});

const Button = styled.button`
  ${$control.minHeight.paddingX.radius};
  ${$flex.center};
`;
```

### Theming System

```tsx
import { createTheme, color, font } from "stylings";

const baseFont = font.family("Inter, sans-serif").lineHeight(1.5).antialiased;

const theme = createTheme({
  spacing: 16,
  typo: {
    base: baseFont,
    header: baseFont.size("2rem").bold,
  },
  colors: {
    primary: color({ color: "red" }),
    text: color({ color: "black" }),
    background: color({ color: "white" }),
  },
});

// Create theme variants
const darkTheme = createThemeVariant(theme, {
  colors: {
    text: color({ color: "white" }),
    background: color({ color: "black" }),
  },
});
```

### Custom Composers

You can create your own composable styles:

```tsx
import { Composer, composer } from "stylings";

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

  // ... more styles

  get all() {
    return this.shadow.base.border.background;
  }
}

export const $dropdown = composer(DropDownStylesComposer);
```

## License

MIT License

Copyright (c) 2024 Adam Pietrasiak

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

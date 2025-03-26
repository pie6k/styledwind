import { MaybeFalsy, isNotFalsy } from "./utils/nullish";
import { ReactNode, createElement, useMemo } from "react";
import { Theme, ThemeInput, ThemeVariant, composeThemeVariants } from "./theme";

import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { useSameArray } from "./utils/hooks";

interface ThemeProviderProps<T extends ThemeInput> {
  theme: Theme<T>;
  activeVariants?: Array<MaybeFalsy<ThemeVariant<T>>>;
  children: ReactNode;
}

export function ThemeProvider<T extends ThemeInput>(props: ThemeProviderProps<T>) {
  const { theme, activeVariants } = props;

  let presentActiveVariants = activeVariants?.filter(isNotFalsy) ?? [];

  presentActiveVariants = useSameArray(presentActiveVariants);

  const resolvedTheme = useMemo(() => {
    return composeThemeVariants(theme, presentActiveVariants);
  }, [theme, presentActiveVariants]);

  return createElement(
    StyledThemeProvider,
    {
      theme: resolvedTheme,
    },
    props.children,
  );
}

import { ThemedValueGetter } from "./ThemedValue";
import { getIsThemeOrVariant } from "./theme";
import { useTheme } from "styled-components";

export function useThemeValue<T>(themedValue: ThemedValueGetter<T>): T {
  const theme = useTheme();

  if (!getIsThemeOrVariant(theme)) {
    throw new Error("useThemeValue must be used within a ThemeProvider");
  }

  return themedValue(theme);
}

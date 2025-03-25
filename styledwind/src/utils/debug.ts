import { RefObject, useEffect } from "react";

import { IS_DEV } from "./env";
import { getFunctionalComponentsStack } from "./react/internals";
import { getIsStyledWindComponent } from "./registry";
import { useConst } from "./hooks";

function getFirstFunctionalParent() {
  const stack = getFunctionalComponentsStack();

  if (!stack) return null;

  for (const ComponentFunction of stack) {
    if (getIsStyledWindComponent(ComponentFunction)) continue;

    return ComponentFunction;
  }

  return null;
}

function getParentComponentName() {
  if (typeof window === "undefined") return null;

  if (!IS_DEV) return null;

  const firstFunctionalParent = getFirstFunctionalParent();

  if (!firstFunctionalParent) return null;

  const functionName = firstFunctionalParent.displayName || firstFunctionalParent.name;

  if (!functionName) return null;

  return functionName;
}

function useElementDebugUIIdDev(ref: RefObject<any>, customName?: string) {
  const parentComponentName = useConst(() => {
    return getParentComponentName();
  });

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const items = [parentComponentName, customName].filter(Boolean);

    if (!items.length) return;

    element.setAttribute("data-ui", items.join("."));
  }, [ref, customName]);
}

export const useElementDebugUIId = IS_DEV ? useElementDebugUIIdDev : () => {};

import { ForwardedRef, RefObject, useMemo, useRef, useState } from "react";

export function useConst<T>(getter: () => T) {
  const [value] = useState(getter);

  return value;
}

export function applyValueToForwardedRef<T>(forwardedRef: ForwardedRef<T>, value: T) {
  if (typeof forwardedRef === "function") {
    forwardedRef(value);
  } else if (forwardedRef != null) {
    forwardedRef.current = value;
  }
}

export function useInnerForwardRef<T>(forwardedRef?: ForwardedRef<T>) {
  const innerRefObject = useMemo<RefObject<T | null>>(() => {
    let currentValue: T | null = null;
    return {
      get current() {
        return currentValue;
      },
      set current(value) {
        currentValue = value;

        if (forwardedRef === undefined) return;

        applyValueToForwardedRef(forwardedRef, value);
      },
    };
  }, [forwardedRef]);

  return innerRefObject;
}

function getAreArraysSame<T>(array1: T[], array2: T[]) {
  if (array1.length !== array2.length) return false;

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) return false;
  }

  return true;
}

export function useSameArray<T>(array: T[]) {
  const currentArray = useRef(array);

  if (!getAreArraysSame(currentArray.current, array)) {
    currentArray.current = array;
  }

  return currentArray.current;
}

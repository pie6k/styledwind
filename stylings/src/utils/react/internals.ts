import * as React from "react";

import { FunctionComponent } from "react";

function getReactInternals() {
  return Reflect.get(React, "__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE");
}

interface ReactFiber {
  return: ReactFiber | null;
  type: any;
}

export const REACT_INTERNALS = getReactInternals();

function getCurrentOwner() {
  const fiber = REACT_INTERNALS?.A?.getOwner?.() as ReactFiber | null;

  if (!fiber) return null;

  return fiber;
}

function getIsFunctionalComponent(input: any): input is FunctionComponent {
  return typeof input === "function";
}

export function getFunctionalComponentsStack() {
  try {
    let owner = getCurrentOwner();

    if (!owner) return null;

    const stack: FunctionComponent[] = [];

    while (owner) {
      if (getIsFunctionalComponent(owner.type)) {
        stack.push(owner.type);
      }
      owner = owner.return;
    }

    return stack;
  } catch (error) {
    return null;
  }
}

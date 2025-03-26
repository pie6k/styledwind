import { FunctionComponent } from "react";

const inlineComponents = new WeakSet<FunctionComponent>();

export function registerStylesComponent(component: FunctionComponent) {
  inlineComponents.add(component);
}

export function getIsStylesComponent(component: FunctionComponent) {
  return inlineComponents.has(component);
}

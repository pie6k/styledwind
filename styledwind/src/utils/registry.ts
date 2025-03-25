import { FunctionComponent } from "react";

const inlineComponents = new WeakSet<FunctionComponent>();

export function registerStyledWindComponent(component: FunctionComponent) {
  inlineComponents.add(component);
}

export function getIsStyledWindComponent(component: FunctionComponent) {
  return inlineComponents.has(component);
}

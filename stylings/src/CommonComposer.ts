import { Composer, styledComposer } from "./Composer";

import { Length } from "./utils";
import type { Properties } from "csstype";
import { resolveMaybeBaseValue } from "./SizeComposer";

export class CommonComposer extends Composer {
  get disabled() {
    return this.addStyle({ opacity: 0.5, pointerEvents: "none" });
  }

  get round() {
    return this.addStyle({ borderRadius: "1000px" });
  }

  get secondary() {
    return this.addStyle({ opacity: 0.5 });
  }

  get tertiary() {
    return this.addStyle({ opacity: 0.25 });
  }

  get quaternary() {
    return this.addStyle({ opacity: 0.125 });
  }

  get notAllowed() {
    return this.addStyle({ cursor: "not-allowed", opacity: 0.5 });
  }

  get fullWidth() {
    return this.addStyle({ width: "100%" });
  }

  get fullHeight() {
    return this.addStyle({ height: "100%" });
  }

  width(width: Length) {
    return this.addStyle({ width: resolveMaybeBaseValue(width) });
  }

  height(height: Length) {
    return this.addStyle({ height: resolveMaybeBaseValue(height) });
  }

  get circle() {
    return this.addStyle({ borderRadius: "1000px" });
  }

  size(size: Length) {
    return this.width(size).height(size);
  }

  z(z: number) {
    return this.addStyle({ zIndex: z });
  }

  get widthFull() {
    return this.width("100%");
  }

  get heightFull() {
    return this.height("100%");
  }

  get relative() {
    return this.addStyle({ position: "relative" });
  }

  get absolute() {
    return this.addStyle({ position: "absolute" });
  }

  get fixed() {
    return this.addStyle({ position: "fixed" });
  }

  get notSelectable() {
    return this.addStyle({ userSelect: "none" });
  }

  cursor(cursor: Properties["cursor"]) {
    return this.addStyle({ cursor });
  }

  pt(py: Length) {
    return this.addStyle({ paddingTop: resolveMaybeBaseValue(py) });
  }

  pb(py: Length) {
    return this.addStyle({ paddingBottom: resolveMaybeBaseValue(py) });
  }

  py(px: Length) {
    return this.pt(px).pb(px);
  }

  pl(px: Length) {
    return this.addStyle({ paddingLeft: resolveMaybeBaseValue(px) });
  }

  pr(px: Length) {
    return this.addStyle({ paddingRight: resolveMaybeBaseValue(px) });
  }

  px(px: Length) {
    return this.pl(px).pr(px);
  }

  p(px: Length) {
    return this.py(px).px(px);
  }

  mt(mt: Length) {
    return this.addStyle({ marginTop: resolveMaybeBaseValue(mt) });
  }

  mb(mb: Length) {
    return this.addStyle({ marginBottom: resolveMaybeBaseValue(mb) });
  }

  my(my: Length) {
    return this.mt(my).mb(my);
  }

  ml(ml: Length) {
    return this.addStyle({ marginLeft: resolveMaybeBaseValue(ml) });
  }

  mr(mr: Length) {
    return this.addStyle({ marginRight: resolveMaybeBaseValue(mr) });
  }

  mx(mx: Length) {
    return this.ml(mx).mr(mx);
  }

  m(mx: Length) {
    return this.my(mx).mx(mx);
  }

  left(left: Length) {
    return this.addStyle({ left: resolveMaybeBaseValue(left) });
  }

  right(right: Length) {
    return this.addStyle({ right: resolveMaybeBaseValue(right) });
  }

  top(top: Length) {
    return this.addStyle({ top: resolveMaybeBaseValue(top) });
  }

  bottom(bottom: Length) {
    return this.addStyle({ bottom: resolveMaybeBaseValue(bottom) });
  }

  inset(inset: Length) {
    return this.top(inset).right(inset).bottom(inset).left(inset);
  }

  aspectRatio(ratio: number) {
    return this.addStyle({ aspectRatio: ratio });
  }

  get square() {
    return this.aspectRatio(1);
  }

  maxWidth(maxWidth: Length) {
    return this.addStyle({ maxWidth: resolveMaybeBaseValue(maxWidth) });
  }

  maxHeight(maxHeight: Length) {
    return this.addStyle({ maxHeight: resolveMaybeBaseValue(maxHeight) });
  }

  minWidth(minWidth: Length) {
    return this.addStyle({ minWidth: resolveMaybeBaseValue(minWidth) });
  }

  minHeight(minHeight: Length) {
    return this.addStyle({ minHeight: resolveMaybeBaseValue(minHeight) });
  }

  x(x: Length) {
    return this.addStyle({ transform: `translateX(${resolveMaybeBaseValue(x)})` });
  }

  y(y: Length) {
    return this.addStyle({ transform: `translateY(${resolveMaybeBaseValue(y)})` });
  }

  get overflowHidden() {
    return this.addStyle({ overflow: "hidden" });
  }

  lineClamp(lines: number) {
    return this.addStyle({
      overflow: "hidden",
      display: "-webkit-box",
      WebkitBoxOrient: "vertical",
      WebkitLineClamp: lines,
    });
  }
}

export const $common = styledComposer(CommonComposer);

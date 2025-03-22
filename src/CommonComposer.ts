import { Length } from "./utils";
import type { Properties } from "csstype";
import { StylesComposer } from "./StylesComposer";
import { resolveMaybeBaseValue } from "./SizeComposer";

interface CommonStylesConfig {
  styles?: string[];
}

export class CommonComposer extends StylesComposer<CommonStylesConfig> {
  constructor(config: CommonStylesConfig) {
    super(config);
  }

  getStyles() {
    return this.config.styles ?? null;
  }

  addStyle(...styles: string[]) {
    return this.updateConfig({ styles: [...(this.config.styles ?? []), ...styles] });
  }

  get disabled() {
    return this.addStyle(`opacity: 0.5;`, `pointer-events: none;`);
  }

  get round() {
    return this.addStyle(`border-radius: 1000px;`);
  }

  get secondary() {
    return this.addStyle(`opacity: 0.5;`);
  }

  get tertiary() {
    return this.addStyle(`opacity: 0.25;`);
  }

  get quaternary() {
    return this.addStyle(`opacity: 0.125;`);
  }

  get ring() {
    return this.addStyle(`
      outline: 2px solid var(--ring, #000000);
      outline-offset: 2px;
      --ring: #000000;
    `);
  }

  get focusRing() {
    return this.addStyle(`
      &:focus-visible {
        outline: 2px solid var(--ring, #000000);
        outline-offset: 2px;
        --ring: #00000088;
      }
    `);
  }

  get notAllowed() {
    return this.addStyle("cursor: not-allowed; opacity: 0.5;");
  }

  get fullWidth() {
    return this.addStyle("width: 100%;");
  }

  get fullHeight() {
    return this.addStyle("height: 100%;");
  }

  width(width: Length) {
    return this.addStyle(`width: ${resolveMaybeBaseValue(width)};`);
  }

  height(height: Length) {
    return this.addStyle(`height: ${resolveMaybeBaseValue(height)};`);
  }

  get circle() {
    return this.addStyle(`border-radius: 1000px;`);
  }

  size(size: Length) {
    return this.width(size).height(size);
  }

  z(z: number) {
    return this.addStyle(`z-index: ${z};`);
  }

  get widthFull() {
    return this.width("100%");
  }

  get heightFull() {
    return this.height("100%");
  }

  get relative() {
    return this.addStyle("position: relative;");
  }

  get absolute() {
    return this.addStyle("position: absolute;");
  }

  get fixed() {
    return this.addStyle("position: fixed;");
  }

  get notSelectable() {
    return this.addStyle("user-select: none;");
  }

  cursor(cursor: Properties["cursor"]) {
    return this.addStyle(`cursor: ${cursor};`);
  }

  pt(py: Length) {
    return this.addStyle(`padding-top: ${resolveMaybeBaseValue(py)};`);
  }

  pb(py: Length) {
    return this.addStyle(`padding-bottom: ${resolveMaybeBaseValue(py)};`);
  }

  py(px: Length) {
    return this.pt(px).pb(px);
  }

  pl(px: Length) {
    return this.addStyle(`padding-left: ${resolveMaybeBaseValue(px)};`);
  }

  pr(px: Length) {
    return this.addStyle(`padding-right: ${resolveMaybeBaseValue(px)};`);
  }

  px(px: Length) {
    return this.pl(px).pr(px);
  }

  p(px: Length) {
    return this.py(px).px(px);
  }

  mt(mt: Length) {
    return this.addStyle(`margin-top: ${resolveMaybeBaseValue(mt)};`);
  }

  mb(mb: Length) {
    return this.addStyle(`margin-bottom: ${resolveMaybeBaseValue(mb)};`);
  }

  my(my: Length) {
    return this.mt(my).mb(my);
  }

  ml(ml: Length) {
    return this.addStyle(`margin-left: ${resolveMaybeBaseValue(ml)};`);
  }

  mr(mr: Length) {
    return this.addStyle(`margin-right: ${resolveMaybeBaseValue(mr)};`);
  }

  mx(mx: Length) {
    return this.ml(mx).mr(mx);
  }

  m(mx: Length) {
    return this.my(mx).mx(mx);
  }

  left(left: Length) {
    return this.addStyle(`left: ${resolveMaybeBaseValue(left)};`);
  }

  right(right: Length) {
    return this.addStyle(`right: ${resolveMaybeBaseValue(right)};`);
  }

  top(top: Length) {
    return this.addStyle(`top: ${resolveMaybeBaseValue(top)};`);
  }

  bottom(bottom: Length) {
    return this.addStyle(`bottom: ${resolveMaybeBaseValue(bottom)};`);
  }

  inset(inset: Length) {
    return this.top(inset).right(inset).bottom(inset).left(inset);
  }

  aspectRatio(ratio: number) {
    return this.addStyle(`aspect-ratio: ${ratio};`);
  }

  get square() {
    return this.aspectRatio(1);
  }

  maxWidth(maxWidth: Length) {
    return this.addStyle(`max-width: ${resolveMaybeBaseValue(maxWidth)};`);
  }

  maxHeight(maxHeight: Length) {
    return this.addStyle(`max-height: ${resolveMaybeBaseValue(maxHeight)};`);
  }

  minWidth(minWidth: Length) {
    return this.addStyle(`min-width: ${resolveMaybeBaseValue(minWidth)};`);
  }

  minHeight(minHeight: Length) {
    return this.addStyle(`min-height: ${resolveMaybeBaseValue(minHeight)};`);
  }

  x(x: Length) {
    return this.addStyle(`transform: translateX(${resolveMaybeBaseValue(x)});`);
  }

  y(y: Length) {
    return this.addStyle(`transform: translateY(${resolveMaybeBaseValue(y)});`);
  }

  get overflowHidden() {
    return this.addStyle(`overflow: hidden;`);
  }

  lineClamp(lines: number) {
    return this.addStyle(`
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: ${lines};
    `);
  }
}

export const style = new CommonComposer({}).start();

import { Composer, composer } from "./Composer";
import { Length, addUnit } from "./utils";

import { Properties } from "csstype";

export class FontComposer extends Composer {
  family(value: Properties["fontFamily"]) {
    return this.addStyle(`font-family: ${value};`);
  }

  size(value: Length) {
    return this.addStyle(`font-size: ${addUnit(value, "em")};`);
  }

  weight(value: Properties["fontWeight"]) {
    return this.addStyle(`font-weight: ${value};`);
  }

  lineHeight(value: Length) {
    return this.addStyle(`line-height: ${addUnit(value, "em")};`);
  }

  get copyLineHeight() {
    return this.lineHeight(1.5);
  }

  get headingLineHeight() {
    return this.lineHeight(1.25);
  }

  get balance() {
    return this.addStyle(`text-wrap: balance;`);
  }

  get uppercase() {
    return this.addStyle(`text-transform: uppercase;`);
  }

  get lowercase() {
    return this.addStyle(`text-transform: lowercase;`);
  }

  get capitalize() {
    return this.addStyle(`text-transform: capitalize;`);
  }

  get underline() {
    return this.addStyle(`text-decoration: underline;`);
  }

  get left() {
    return this.addStyle(`text-align: left;`);
  }

  get center() {
    return this.addStyle(`text-align: center;`);
  }

  get right() {
    return this.addStyle(`text-align: right;`);
  }

  get ellipsis() {
    return this.addStyle(`text-overflow: ellipsis; white-space: nowrap; overflow: hidden;`);
  }

  get resetLineHeight() {
    return this.lineHeight(1);
  }

  maxLines(value: number) {
    return this.addStyle({
      WebkitLineClamp: value,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      display: "-webkit-box",
    });
  }

  opacity(value: number) {
    return this.addStyle(`opacity: ${value};`);
  }

  get secondary() {
    return this.opacity(0.5);
  }

  get tertiary() {
    return this.opacity(0.3);
  }

  get w100() {
    return this.weight(100);
  }

  get w200() {
    return this.weight(200);
  }

  get w300() {
    return this.weight(300);
  }

  get w400() {
    return this.weight(400);
  }

  get w500() {
    return this.weight(500);
  }

  get normal() {
    return this.weight(400);
  }

  get w600() {
    return this.weight(600);
  }

  letterSpacing(value: Length) {
    return this.addStyle(`letter-spacing: ${addUnit(value, "em")};`);
  }

  get w700() {
    return this.weight(700);
  }

  get w800() {
    return this.weight(800);
  }

  get w900() {
    return this.weight(900);
  }

  get nowrap() {
    return this.addStyle(`white-space: nowrap;`);
  }

  get antialiased() {
    return this.addStyle(`-webkit-font-smoothing: antialiased;`);
  }
}

export const $font = composer(FontComposer);

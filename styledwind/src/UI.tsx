import { ComponentProps, createElement, FunctionComponent, HTMLAttributes, ReactNode, type JSX } from "react";

import styled from "styled-components";
import { resolveStylesInput, StylesInput } from "./input";
import { type AnyStyledComposer } from "./Composer";
import { useElementDebugUIId } from "./utils/debug";
import { useInnerForwardRef, useSameArray } from "./utils/hooks";
import { memoizeFn } from "./utils/memoize";
import { registerStylesComponent } from "./utils/registry";

type IntrinsicElementName = keyof JSX.IntrinsicElements;

interface StylesExtraProps {
  as?: IntrinsicElementName;
  styles?: StylesInput;
}

type SWIntrinsicProps<T extends IntrinsicElementName> = ComponentProps<T> & StylesExtraProps;

type SWIntrinsicComponent<T extends IntrinsicElementName> = (props: SWIntrinsicProps<T>) => ReactNode;

type InferSWComponentFromKey<T extends string> = T extends `${string}_${infer T}`
  ? T extends IntrinsicElementName
    ? SWIntrinsicComponent<T>
    : never
  : never;

type CustomStylesComponents = {
  [P in `${string}_${IntrinsicElementName}`]: InferSWComponentFromKey<P>;
} & Record<string, SWIntrinsicComponent<"div">>;

const createStylesComponent = memoizeFn(function createStylesComponent<T extends IntrinsicElementName>(
  intrinsicComponentType: T,
  customName?: string,
): SWIntrinsicComponent<T> {
  function StylesComponent({ styles, as: asType = intrinsicComponentType, ref, ...props }: SWIntrinsicProps<T>) {
    const innerRef = useInnerForwardRef<any>(ref);

    const stylesList = useSameArray(resolveStylesInput(styles));

    useElementDebugUIId(innerRef, customName);

    return createElement(SW, {
      // Make it always first in the inspector
      "data-ui": customName,
      as: asType,
      ref: innerRef,
      $styles: stylesList,
      ...(props as HTMLAttributes<HTMLDivElement>),
    }) as ReactNode;
  }

  StylesComponent.displayName = `StylesComponent${intrinsicComponentType}`;

  registerStylesComponent(StylesComponent as FunctionComponent);

  return StylesComponent;
});

const createStylingsComponentFromCustomName = memoizeFn(function createStylingsComponentFromCustomName(
  customName: string,
) {
  if (!customName.includes("_")) return createStylesComponent("div", customName);

  const [componentName, intrinsicElement] = customName.split("_");

  if (!intrinsicElement) return createStylesComponent("div", customName);

  if (!getIsIntrinsicElementName(intrinsicElement)) return createStylesComponent("div", customName);

  return createStylesComponent(intrinsicElement, componentName);
});

const stylingsBuiltInComponents = {
  a: createStylesComponent("a"),
  abbr: createStylesComponent("abbr"),
  address: createStylesComponent("address"),
  area: createStylesComponent("area"),
  article: createStylesComponent("article"),
  aside: createStylesComponent("aside"),
  audio: createStylesComponent("audio"),
  b: createStylesComponent("b"),
  base: createStylesComponent("base"),
  bdi: createStylesComponent("bdi"),
  bdo: createStylesComponent("bdo"),
  blockquote: createStylesComponent("blockquote"),
  body: createStylesComponent("body"),
  br: createStylesComponent("br"),
  button: createStylesComponent("button"),
  canvas: createStylesComponent("canvas"),
  caption: createStylesComponent("caption"),
  cite: createStylesComponent("cite"),
  code: createStylesComponent("code"),
  col: createStylesComponent("col"),
  colgroup: createStylesComponent("colgroup"),
  data: createStylesComponent("data"),
  datalist: createStylesComponent("datalist"),
  dd: createStylesComponent("dd"),
  del: createStylesComponent("del"),
  details: createStylesComponent("details"),
  dfn: createStylesComponent("dfn"),
  dialog: createStylesComponent("dialog"),
  div: createStylesComponent("div"),
  dl: createStylesComponent("dl"),
  dt: createStylesComponent("dt"),
  em: createStylesComponent("em"),
  embed: createStylesComponent("embed"),
  fieldset: createStylesComponent("fieldset"),
  figcaption: createStylesComponent("figcaption"),
  figure: createStylesComponent("figure"),
  footer: createStylesComponent("footer"),
  form: createStylesComponent("form"),
  h1: createStylesComponent("h1"),
  h2: createStylesComponent("h2"),
  h3: createStylesComponent("h3"),
  h4: createStylesComponent("h4"),
  h5: createStylesComponent("h5"),
  h6: createStylesComponent("h6"),
  head: createStylesComponent("head"),
  header: createStylesComponent("header"),
  hr: createStylesComponent("hr"),
  html: createStylesComponent("html"),
  i: createStylesComponent("i"),
  iframe: createStylesComponent("iframe"),
  img: createStylesComponent("img"),
  input: createStylesComponent("input"),
  ins: createStylesComponent("ins"),
  kbd: createStylesComponent("kbd"),
  label: createStylesComponent("label"),
  legend: createStylesComponent("legend"),
  li: createStylesComponent("li"),
  link: createStylesComponent("link"),
  main: createStylesComponent("main"),
  map: createStylesComponent("map"),
  mark: createStylesComponent("mark"),
  menu: createStylesComponent("menu"),
  meta: createStylesComponent("meta"),
  meter: createStylesComponent("meter"),
  nav: createStylesComponent("nav"),
  noscript: createStylesComponent("noscript"),
  object: createStylesComponent("object"),
  ol: createStylesComponent("ol"),
  optgroup: createStylesComponent("optgroup"),
  option: createStylesComponent("option"),
  output: createStylesComponent("output"),
  p: createStylesComponent("p"),
  picture: createStylesComponent("picture"),
  pre: createStylesComponent("pre"),
  progress: createStylesComponent("progress"),
  q: createStylesComponent("q"),
  rp: createStylesComponent("rp"),
  rt: createStylesComponent("rt"),
  ruby: createStylesComponent("ruby"),
  s: createStylesComponent("s"),
  samp: createStylesComponent("samp"),
  script: createStylesComponent("script"),
  section: createStylesComponent("section"),
  select: createStylesComponent("select"),
  small: createStylesComponent("small"),
  source: createStylesComponent("source"),
  span: createStylesComponent("span"),
  strong: createStylesComponent("strong"),
  style: createStylesComponent("style"),
  sub: createStylesComponent("sub"),
  summary: createStylesComponent("summary"),
  sup: createStylesComponent("sup"),
  table: createStylesComponent("table"),
  tbody: createStylesComponent("tbody"),
  td: createStylesComponent("td"),
  template: createStylesComponent("template"),
  textarea: createStylesComponent("textarea"),
  tfoot: createStylesComponent("tfoot"),
  th: createStylesComponent("th"),
  thead: createStylesComponent("thead"),
  time: createStylesComponent("time"),
  title: createStylesComponent("title"),
  tr: createStylesComponent("tr"),
  track: createStylesComponent("track"),
  u: createStylesComponent("u"),
  ul: createStylesComponent("ul"),
  var: createStylesComponent("var"),
  video: createStylesComponent("video"),
  wbr: createStylesComponent("wbr"),
  // SVG elements
  circle: createStylesComponent("circle"),
  clipPath: createStylesComponent("clipPath"),
  defs: createStylesComponent("defs"),
  desc: createStylesComponent("desc"),
  ellipse: createStylesComponent("ellipse"),
  feBlend: createStylesComponent("feBlend"),
  feColorMatrix: createStylesComponent("feColorMatrix"),
  feComponentTransfer: createStylesComponent("feComponentTransfer"),
  feComposite: createStylesComponent("feComposite"),
  feConvolveMatrix: createStylesComponent("feConvolveMatrix"),
  feDiffuseLighting: createStylesComponent("feDiffuseLighting"),
  feDisplacementMap: createStylesComponent("feDisplacementMap"),
  feDistantLight: createStylesComponent("feDistantLight"),
  feDropShadow: createStylesComponent("feDropShadow"),
  feFlood: createStylesComponent("feFlood"),
  feFuncA: createStylesComponent("feFuncA"),
  feFuncB: createStylesComponent("feFuncB"),
  feFuncG: createStylesComponent("feFuncG"),
  feFuncR: createStylesComponent("feFuncR"),
  feGaussianBlur: createStylesComponent("feGaussianBlur"),
  feImage: createStylesComponent("feImage"),
  feMerge: createStylesComponent("feMerge"),
  feMergeNode: createStylesComponent("feMergeNode"),
  feMorphology: createStylesComponent("feMorphology"),
  feOffset: createStylesComponent("feOffset"),
  fePointLight: createStylesComponent("fePointLight"),
  feSpecularLighting: createStylesComponent("feSpecularLighting"),
  feSpotLight: createStylesComponent("feSpotLight"),
  feTile: createStylesComponent("feTile"),
  feTurbulence: createStylesComponent("feTurbulence"),
  filter: createStylesComponent("filter"),
  foreignObject: createStylesComponent("foreignObject"),
  g: createStylesComponent("g"),
  image: createStylesComponent("image"),
  line: createStylesComponent("line"),
  linearGradient: createStylesComponent("linearGradient"),
  marker: createStylesComponent("marker"),
  mask: createStylesComponent("mask"),
  metadata: createStylesComponent("metadata"),
  mpath: createStylesComponent("mpath"),
  path: createStylesComponent("path"),
  pattern: createStylesComponent("pattern"),
  polygon: createStylesComponent("polygon"),
  polyline: createStylesComponent("polyline"),
  radialGradient: createStylesComponent("radialGradient"),
  rect: createStylesComponent("rect"),
  set: createStylesComponent("set"),
  stop: createStylesComponent("stop"),
  switch: createStylesComponent("switch"),
  symbol: createStylesComponent("symbol"),
  text: createStylesComponent("text"),
  textPath: createStylesComponent("textPath"),
  tspan: createStylesComponent("tspan"),
  use: createStylesComponent("use"),
  view: createStylesComponent("view"),
  animate: createStylesComponent("animate"),
  animateMotion: createStylesComponent("animateMotion"),
  animateTransform: createStylesComponent("animateTransform"),
  big: createStylesComponent("big"),
  center: createStylesComponent("center"),
  hgroup: createStylesComponent("hgroup"),
  keygen: createStylesComponent("keygen"),
  menuitem: createStylesComponent("menuitem"),
  noindex: createStylesComponent("noindex"),
  param: createStylesComponent("param"),
  search: createStylesComponent("search"),
  slot: createStylesComponent("slot"),
  svg: createStylesComponent("svg"),
  webview: createStylesComponent("webview"),
} satisfies Record<IntrinsicElementName, SWIntrinsicComponent<any>>;

function getIsIntrinsicElementName(element: string | symbol): element is IntrinsicElementName {
  return element in stylingsBuiltInComponents;
}

export type StylesComponentsLibrary = typeof stylingsBuiltInComponents & CustomStylesComponents;

export const UI = new Proxy(stylingsBuiltInComponents, {
  get(builtInElements, prop) {
    if (getIsIntrinsicElementName(prop)) return builtInElements[prop];

    return createStylingsComponentFromCustomName(prop as string);
  },
}) as StylesComponentsLibrary;

const SW = styled.div<{ $styles?: AnyStyledComposer[] }>`
  ${(props) => props.$styles}
`;

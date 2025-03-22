import { ComponentProps, createElement, FunctionComponent, HTMLAttributes, ReactNode, type JSX } from "react";

import styled from "styled-components";
import { resolveStylesInput, StylesInput } from "./input";
import { type AnyStylesComposer } from "./StylesComposer";
import { useElementDebugUIId } from "./utils/debug";
import { useInnerForwardRef, useSameArray } from "./utils/hooks";
import { memoizeFn } from "./utils/memoize";
import { registerStyledWindComponent } from "./utils/registry";

type IntrinsicElementName = keyof JSX.IntrinsicElements;

interface StyledWindExtraProps {
  as?: IntrinsicElementName;
  styles?: StylesInput;
}

type SWIntrinsicProps<T extends IntrinsicElementName> = ComponentProps<T> & StyledWindExtraProps;

type SWIntrinsicComponent<T extends IntrinsicElementName> = (props: SWIntrinsicProps<T>) => ReactNode;

type InferSWComponentFromKey<T extends string> = T extends `${string}_${infer T}`
  ? T extends IntrinsicElementName
    ? SWIntrinsicComponent<T>
    : never
  : never;

type CustomStyledWindComponents = {
  [P in `${string}_${IntrinsicElementName}`]: InferSWComponentFromKey<P>;
} & Record<string, SWIntrinsicComponent<"div">>;

const createStyledWindComponent = memoizeFn(function createStyledWindComponent<T extends IntrinsicElementName>(
  intrinsicComponentType: T,
  customName?: string,
): SWIntrinsicComponent<T> {
  function StyledWindComponent({ styles, as: asType = intrinsicComponentType, ref, ...props }: SWIntrinsicProps<T>) {
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

  StyledWindComponent.displayName = `StyledWind${intrinsicComponentType}`;

  registerStyledWindComponent(StyledWindComponent as FunctionComponent);

  return StyledWindComponent;
});

const createStyledwindComponentFromCustomName = memoizeFn(function createStyledWindFromCustomName(customName: string) {
  if (!customName.includes("_")) return createStyledWindComponent("div", customName);

  const [componentName, intrinsicElement] = customName.split("_");

  if (!intrinsicElement) return createStyledWindComponent("div", customName);

  if (!getIsIntrinsicElementName(intrinsicElement)) return createStyledWindComponent("div", customName);

  return createStyledWindComponent(intrinsicElement, componentName);
});

const styledwindBuiltInComponents = {
  a: createStyledWindComponent("a"),
  abbr: createStyledWindComponent("abbr"),
  address: createStyledWindComponent("address"),
  area: createStyledWindComponent("area"),
  article: createStyledWindComponent("article"),
  aside: createStyledWindComponent("aside"),
  audio: createStyledWindComponent("audio"),
  b: createStyledWindComponent("b"),
  base: createStyledWindComponent("base"),
  bdi: createStyledWindComponent("bdi"),
  bdo: createStyledWindComponent("bdo"),
  blockquote: createStyledWindComponent("blockquote"),
  body: createStyledWindComponent("body"),
  br: createStyledWindComponent("br"),
  button: createStyledWindComponent("button"),
  canvas: createStyledWindComponent("canvas"),
  caption: createStyledWindComponent("caption"),
  cite: createStyledWindComponent("cite"),
  code: createStyledWindComponent("code"),
  col: createStyledWindComponent("col"),
  colgroup: createStyledWindComponent("colgroup"),
  data: createStyledWindComponent("data"),
  datalist: createStyledWindComponent("datalist"),
  dd: createStyledWindComponent("dd"),
  del: createStyledWindComponent("del"),
  details: createStyledWindComponent("details"),
  dfn: createStyledWindComponent("dfn"),
  dialog: createStyledWindComponent("dialog"),
  div: createStyledWindComponent("div"),
  dl: createStyledWindComponent("dl"),
  dt: createStyledWindComponent("dt"),
  em: createStyledWindComponent("em"),
  embed: createStyledWindComponent("embed"),
  fieldset: createStyledWindComponent("fieldset"),
  figcaption: createStyledWindComponent("figcaption"),
  figure: createStyledWindComponent("figure"),
  footer: createStyledWindComponent("footer"),
  form: createStyledWindComponent("form"),
  h1: createStyledWindComponent("h1"),
  h2: createStyledWindComponent("h2"),
  h3: createStyledWindComponent("h3"),
  h4: createStyledWindComponent("h4"),
  h5: createStyledWindComponent("h5"),
  h6: createStyledWindComponent("h6"),
  head: createStyledWindComponent("head"),
  header: createStyledWindComponent("header"),
  hr: createStyledWindComponent("hr"),
  html: createStyledWindComponent("html"),
  i: createStyledWindComponent("i"),
  iframe: createStyledWindComponent("iframe"),
  img: createStyledWindComponent("img"),
  input: createStyledWindComponent("input"),
  ins: createStyledWindComponent("ins"),
  kbd: createStyledWindComponent("kbd"),
  label: createStyledWindComponent("label"),
  legend: createStyledWindComponent("legend"),
  li: createStyledWindComponent("li"),
  link: createStyledWindComponent("link"),
  main: createStyledWindComponent("main"),
  map: createStyledWindComponent("map"),
  mark: createStyledWindComponent("mark"),
  menu: createStyledWindComponent("menu"),
  meta: createStyledWindComponent("meta"),
  meter: createStyledWindComponent("meter"),
  nav: createStyledWindComponent("nav"),
  noscript: createStyledWindComponent("noscript"),
  object: createStyledWindComponent("object"),
  ol: createStyledWindComponent("ol"),
  optgroup: createStyledWindComponent("optgroup"),
  option: createStyledWindComponent("option"),
  output: createStyledWindComponent("output"),
  p: createStyledWindComponent("p"),
  picture: createStyledWindComponent("picture"),
  pre: createStyledWindComponent("pre"),
  progress: createStyledWindComponent("progress"),
  q: createStyledWindComponent("q"),
  rp: createStyledWindComponent("rp"),
  rt: createStyledWindComponent("rt"),
  ruby: createStyledWindComponent("ruby"),
  s: createStyledWindComponent("s"),
  samp: createStyledWindComponent("samp"),
  script: createStyledWindComponent("script"),
  section: createStyledWindComponent("section"),
  select: createStyledWindComponent("select"),
  small: createStyledWindComponent("small"),
  source: createStyledWindComponent("source"),
  span: createStyledWindComponent("span"),
  strong: createStyledWindComponent("strong"),
  style: createStyledWindComponent("style"),
  sub: createStyledWindComponent("sub"),
  summary: createStyledWindComponent("summary"),
  sup: createStyledWindComponent("sup"),
  table: createStyledWindComponent("table"),
  tbody: createStyledWindComponent("tbody"),
  td: createStyledWindComponent("td"),
  template: createStyledWindComponent("template"),
  textarea: createStyledWindComponent("textarea"),
  tfoot: createStyledWindComponent("tfoot"),
  th: createStyledWindComponent("th"),
  thead: createStyledWindComponent("thead"),
  time: createStyledWindComponent("time"),
  title: createStyledWindComponent("title"),
  tr: createStyledWindComponent("tr"),
  track: createStyledWindComponent("track"),
  u: createStyledWindComponent("u"),
  ul: createStyledWindComponent("ul"),
  var: createStyledWindComponent("var"),
  video: createStyledWindComponent("video"),
  wbr: createStyledWindComponent("wbr"),
  // SVG elements
  circle: createStyledWindComponent("circle"),
  clipPath: createStyledWindComponent("clipPath"),
  defs: createStyledWindComponent("defs"),
  desc: createStyledWindComponent("desc"),
  ellipse: createStyledWindComponent("ellipse"),
  feBlend: createStyledWindComponent("feBlend"),
  feColorMatrix: createStyledWindComponent("feColorMatrix"),
  feComponentTransfer: createStyledWindComponent("feComponentTransfer"),
  feComposite: createStyledWindComponent("feComposite"),
  feConvolveMatrix: createStyledWindComponent("feConvolveMatrix"),
  feDiffuseLighting: createStyledWindComponent("feDiffuseLighting"),
  feDisplacementMap: createStyledWindComponent("feDisplacementMap"),
  feDistantLight: createStyledWindComponent("feDistantLight"),
  feDropShadow: createStyledWindComponent("feDropShadow"),
  feFlood: createStyledWindComponent("feFlood"),
  feFuncA: createStyledWindComponent("feFuncA"),
  feFuncB: createStyledWindComponent("feFuncB"),
  feFuncG: createStyledWindComponent("feFuncG"),
  feFuncR: createStyledWindComponent("feFuncR"),
  feGaussianBlur: createStyledWindComponent("feGaussianBlur"),
  feImage: createStyledWindComponent("feImage"),
  feMerge: createStyledWindComponent("feMerge"),
  feMergeNode: createStyledWindComponent("feMergeNode"),
  feMorphology: createStyledWindComponent("feMorphology"),
  feOffset: createStyledWindComponent("feOffset"),
  fePointLight: createStyledWindComponent("fePointLight"),
  feSpecularLighting: createStyledWindComponent("feSpecularLighting"),
  feSpotLight: createStyledWindComponent("feSpotLight"),
  feTile: createStyledWindComponent("feTile"),
  feTurbulence: createStyledWindComponent("feTurbulence"),
  filter: createStyledWindComponent("filter"),
  foreignObject: createStyledWindComponent("foreignObject"),
  g: createStyledWindComponent("g"),
  image: createStyledWindComponent("image"),
  line: createStyledWindComponent("line"),
  linearGradient: createStyledWindComponent("linearGradient"),
  marker: createStyledWindComponent("marker"),
  mask: createStyledWindComponent("mask"),
  metadata: createStyledWindComponent("metadata"),
  mpath: createStyledWindComponent("mpath"),
  path: createStyledWindComponent("path"),
  pattern: createStyledWindComponent("pattern"),
  polygon: createStyledWindComponent("polygon"),
  polyline: createStyledWindComponent("polyline"),
  radialGradient: createStyledWindComponent("radialGradient"),
  rect: createStyledWindComponent("rect"),
  set: createStyledWindComponent("set"),
  stop: createStyledWindComponent("stop"),
  switch: createStyledWindComponent("switch"),
  symbol: createStyledWindComponent("symbol"),
  text: createStyledWindComponent("text"),
  textPath: createStyledWindComponent("textPath"),
  tspan: createStyledWindComponent("tspan"),
  use: createStyledWindComponent("use"),
  view: createStyledWindComponent("view"),
  animate: createStyledWindComponent("animate"),
  animateMotion: createStyledWindComponent("animateMotion"),
  animateTransform: createStyledWindComponent("animateTransform"),
  big: createStyledWindComponent("big"),
  center: createStyledWindComponent("center"),
  hgroup: createStyledWindComponent("hgroup"),
  keygen: createStyledWindComponent("keygen"),
  menuitem: createStyledWindComponent("menuitem"),
  noindex: createStyledWindComponent("noindex"),
  param: createStyledWindComponent("param"),
  search: createStyledWindComponent("search"),
  slot: createStyledWindComponent("slot"),
  svg: createStyledWindComponent("svg"),
  webview: createStyledWindComponent("webview"),
} satisfies Record<IntrinsicElementName, SWIntrinsicComponent<any>>;

function getIsIntrinsicElementName(element: string | symbol): element is IntrinsicElementName {
  return element in styledwindBuiltInComponents;
}

type StyledWindComponentsLibrary = typeof styledwindBuiltInComponents & CustomStyledWindComponents;

export const UI = new Proxy(styledwindBuiltInComponents, {
  get(builtInElements, prop) {
    if (getIsIntrinsicElementName(prop)) return builtInElements[prop];

    return createStyledwindComponentFromCustomName(prop as string);
  },
}) as StyledWindComponentsLibrary;

const SW = styled.div<{ $styles?: AnyStylesComposer[] }>`
  ${(props) => props.$styles}
`;

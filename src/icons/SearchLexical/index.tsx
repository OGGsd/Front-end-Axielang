import type React from "react";
import { forwardRef } from "react";
import SvgSearchLexicalIcon from "./SearchLexicalIcon";

export const SearchLexicalIcon = forwardRef<
  SVGSVGElement,
  React.PropsWithChildren<{}>
>((props, ref) => {
  return <SvgSearchLexicalIcon ref={ref} {...props} />;
});

import React from "react";
import Content from "@theme-original/DocItem/Content";
import type ContentType from "@theme/DocItem/Content";
import type {WrapperProps} from "@docusaurus/types";

import CopyPageMenu from "../../CopyPageMenu";

type Props = WrapperProps<typeof ContentType>;

// Wrap (not eject) the doc content so the original renders untouched — every
// admonition, table, and MDX component behaves exactly as before. We only add
// the "Copy page" menu above the article body.
export default function ContentWrapper(props: Props): React.ReactElement {
  return (
    <>
      <CopyPageMenu />
      <Content {...props} />
    </>
  );
}

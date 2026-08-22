/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import React from "react";
import { Link as RRLink } from "react-router";
import { ensureTrailingSlash } from "./helper";

type NextLinkProps = React.ComponentProps<"a"> & {
  href: string;
  replace?: boolean;
  prefetch?: boolean; // next.js prop, ignored
  scroll?: boolean; // next.js prop, ignored
  shallow?: boolean; // next.js prop, ignored
};

/*
 * Ref-forwarding matters here beyond tidiness: this shim stands in for
 * `next/link` everywhere in the app, and the tooltip, dropdown and popover
 * primitives all anchor by attaching a ref to their child. Without forwarding,
 * every one of those wrapped around a link logged "Function components cannot
 * be given refs" and had no element to position against.
 */
const Link = React.forwardRef<HTMLAnchorElement, NextLinkProps>(function Link(
  { href, replace, prefetch: _prefetch, scroll: _scroll, shallow: _shallow, ...rest },
  ref
) {
  return <RRLink to={ensureTrailingSlash(href)} replace={replace} ref={ref} {...rest} />;
});

export default Link;

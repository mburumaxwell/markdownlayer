import Markdoc, { type RenderableTreeNode } from '@markdoc/markdoc';
import type { MDXComponents } from 'mdx/types';
import React from 'react';
import ReactDOM from 'react-dom';
import * as _jsx_runtime from 'react/jsx-runtime';

type MdxContentProps = {
  [props: string]: unknown;
  components?: MDXComponents;
};

export function getMDXComponent(code: string, globals: Record<string, unknown> = {}): React.FC<MdxContentProps> {
  const scope = { React, ReactDOM, _jsx_runtime, ...globals };
  const fn = new Function(...Object.keys(scope), code);
  return fn(...Object.values(scope)).default;
}

export function useMDXComponent(code: string, globals: Record<string, unknown> = {}) {
  return React.useMemo(() => getMDXComponent(code, globals), [code, globals]);
}

export function getMdocComponent(code: string, components = {}): React.ReactNode {
  var tree = JSON.parse(code) as RenderableTreeNode;
  return Markdoc.renderers.react(tree, React, { components });
}

export function useMdocComponent(code: string, components = {}) {
  return React.useMemo(() => getMdocComponent(code, components), [code, components]);
}

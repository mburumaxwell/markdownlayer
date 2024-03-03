export type DynamicRouteSlug = string | string[] | undefined;

export interface SlugFromParamsProps {
  slug: DynamicRouteSlug;
  /**
   * @example 'blog/posts'
   * @example 'legal'
   * @example 'docs/guides'
   * @example 'docs/api'
   * @example 'docs/cli'
   * @example 'docs/js'
   */
  prefix?: string;
}

export function slugFromParams({ slug, prefix }: SlugFromParamsProps): string {
  if (!slug) return prefix ? prefix : ''; // for the root route
  slug = Array.isArray(slug) ? slug.join('/') : slug;
  return `${prefix ? prefix : ''}/${slug}`;
}

export interface StaticParamsFromSlugProps {
  slug: string;

  /**
   * @example 'blog/posts'
   * @example 'legal'
   * @example 'docs/guides'
   * @example 'docs/api'
   * @example 'docs/cli'
   * @example 'docs/js'
   */
  prefix?: string;

  /**
   * Whether to return an array of strings instead of a string.
   * Use this capturing dynamic routes with multiple segments e.g. `blog/[...slug]`
   */
  array?: true;
}

export type StaticParams = { slug: DynamicRouteSlug };

export function staticParamsFromSlug({ slug, prefix, array }: StaticParamsFromSlugProps): StaticParams {
  if (prefix) slug = slug.replace(prefix, '');
  slug = slug.replace(/^\/+|\/+$/, '');
  return { slug: array ? slug.split('/') : slug };
}

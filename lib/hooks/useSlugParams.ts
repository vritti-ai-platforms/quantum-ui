import { useParams } from 'react-router-dom';
import { parseSlug } from '../utils/slug';

export interface SlugParam {
  slug: string;
  name: string;
  id: string;
}

type SlugParamMap<T extends string[]> = { [K in T[number]]: SlugParam };

function parseParam(value: string | undefined): SlugParam {
  const v = value ?? '';
  const parsed = parseSlug(v);
  return { slug: v, name: parsed?.slug ?? '', id: parsed?.id ?? v };
}

// Single param — returns SlugParam directly for clean destructuring
export function useSlugParams<T extends string>(param: T): SlugParam;
// Multiple params — returns { paramA: SlugParam; paramB: SlugParam }
export function useSlugParams<T extends string[]>(...params: T): SlugParamMap<T>;
export function useSlugParams(...params: string[]): SlugParam | SlugParamMap<string[]> {
  const routeParams = useParams();

  if (params.length === 1) {
    return parseParam(routeParams[params[0]]);
  }

  const result: Record<string, SlugParam> = {};
  for (const param of params) {
    result[param] = parseParam(routeParams[param]);
  }
  return result;
}

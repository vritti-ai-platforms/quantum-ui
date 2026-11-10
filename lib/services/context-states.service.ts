import { getConfig } from '../config';
import type { FilterCondition } from '../types/conditions';
import { axios } from '../utils/axios';

const silent = { showSuccessToast: false, showErrorToast: false } as const;

// Fetches a view's saved context; none when nothing is saved
export function getContextState(slug: string): Promise<FilterCondition[]> {
  return axios
    .get<{ context: FilterCondition[] }>(getConfig().views.contextStatesEndpoint, { params: { slug }, ...silent })
    .then((r) => r.data.context);
}

// Replaces a view's saved context — what its context bar holds
export function putContextState(slug: string, context: FilterCondition[]): Promise<void> {
  return axios.put(getConfig().views.contextStatesEndpoint, { slug, context }, silent).then(() => undefined);
}

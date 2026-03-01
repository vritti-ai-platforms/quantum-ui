import type { TableViewState } from '../types/table-filter';
import { getConfig } from '../config';
import { axios } from '../utils/axios';

export interface TableViewRecord {
  id: string;
  name: string;
  tableSlug: string;
  state: TableViewState;
  isShared: boolean;
  isCurrent: boolean;
  isOwn: boolean;
  createdAt: string;
  updatedAt: string | null;
}

// Resolves the views endpoint from config at call time
function viewsUrl(path = '') {
  return `${getConfig().views?.viewsEndpoint ?? 'table-views'}${path}`;
}

// Silence toasts — these are silent background operations
const silent = { showSuccessToast: false, showErrorToast: false } as const;

// Fetches all named views for a given table slug
export function fetchViews(tableSlug: string): Promise<TableViewRecord[]> {
  return axios.get<TableViewRecord[]>(viewsUrl(), { params: { tableSlug }, ...silent }).then((r) => r.data);
}

// Creates a new named view with the given state
export function createView(dto: {
  name: string;
  tableSlug: string;
  state: TableViewState;
  isShared?: boolean;
}): Promise<TableViewRecord> {
  return axios.post<TableViewRecord>(viewsUrl(), dto, silent).then((r) => r.data);
}

// Updates an existing view's name, state, or sharing setting
export function updateView(
  id: string,
  dto: { name?: string; state?: TableViewState; isShared?: boolean },
): Promise<TableViewRecord> {
  return axios.patch<TableViewRecord>(viewsUrl(`/${id}`), dto, silent).then((r) => r.data);
}

// Deletes a named view by ID
export function deleteView(id: string): Promise<void> {
  return axios.delete(viewsUrl(`/${id}`), silent).then(() => undefined);
}

// Resolves the states endpoint from config at call time
function statesUrl() {
  return getConfig().views?.statesEndpoint ?? 'table-states';
}

// Upserts the live table state (filters, sort, columnVisibility)
export function upsertTableState(tableSlug: string, state: TableViewState): Promise<void> {
  return axios.post(statesUrl(), { tableSlug, state }, silent).then(() => undefined);
}

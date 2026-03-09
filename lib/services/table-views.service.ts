import { getConfig } from '../config';
import type { TableViewState } from '../types/table-filter';
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
  return `${getConfig().views.viewsEndpoint}${path}`;
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

// Saves updated state to an existing view
export function updateView(id: string, state: TableViewState): Promise<TableViewRecord> {
  return axios.patch<TableViewRecord>(viewsUrl(`/${id}`), { state }, silent).then((r) => r.data);
}

// Toggles whether a view is shared with all users
export function toggleShareView(id: string, isShared: boolean): Promise<TableViewRecord> {
  return axios.patch<TableViewRecord>(viewsUrl(`/${id}/share`), { isShared }, silent).then((r) => r.data);
}

// Renames an existing view
export function renameView(id: string, name: string): Promise<TableViewRecord> {
  return axios.patch<TableViewRecord>(viewsUrl(`/${id}/rename`), { name }, silent).then((r) => r.data);
}

// Deletes a named view by ID
export function deleteView(id: string): Promise<void> {
  return axios.delete(viewsUrl(`/${id}`), silent).then(() => undefined);
}

// Resolves the states endpoint from config at call time
function statesUrl() {
  return getConfig().views.statesEndpoint;
}

// Pushes the live table state (filters, sort, columnVisibility) along with the active view to Redis
export function pushTableState(tableSlug: string, state: TableViewState, activeViewId: string | null): Promise<void> {
  return axios.post(statesUrl(), { tableSlug, state, activeViewId }, silent).then(() => undefined);
}

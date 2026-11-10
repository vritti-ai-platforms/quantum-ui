import { getConfig } from '../config';
import type { FilterCondition } from '../types/conditions';
import type { TableState } from '../types/table-state';
import { axios } from '../utils/axios';

export interface TableViewRecord {
  id: string;
  name: string;
  tableSlug: string;
  state: TableState;
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
  state: TableState;
  isShared?: boolean;
}): Promise<TableViewRecord> {
  return axios.post<TableViewRecord>(viewsUrl(), dto, silent).then((r) => r.data);
}

// Saves updated state to an existing view
export function updateView(id: string, state: TableState): Promise<TableViewRecord> {
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

// Replaces a table's saved state (filters, sort, columns) and its active view
export function putTableState(tableSlug: string, state: TableState, activeViewId: string | null): Promise<void> {
  return axios.put(statesUrl(), { tableSlug, state, activeViewId }, silent).then(() => undefined);
}

// Sets context conditions in a table's saved state, keeping the rest, so a link can open the table at that context
export function setTableContext(tableSlug: string, context: FilterCondition[]): Promise<void> {
  return axios.patch(statesUrl(), { tableSlug, context }, silent).then(() => undefined);
}

import type { TableViewState } from './table-filter';

export type MutationResponse = {
  success: boolean;
  message: string;
};

export interface SuccessResponse {
  success: boolean;
  message: string;
}

export interface TableResponse<T> {
  result: T[];
  count: number;
  state: TableViewState;
  activeViewId: string | null;
}

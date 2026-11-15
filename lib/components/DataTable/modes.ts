// What sits above a table decides how much of the viewport it gets: a page header (page), plus a tab strip (tab), a
// step indicator (stepper), or both (stepperTab); compact sits beside a panel, under a form or in a dialog
export const DATA_TABLE_MODE_HEIGHTS = {
  page: 'calc(100vh - 280px)',
  tab: 'calc(100vh - 320px)',
  stepper: 'calc(100vh - 355px)',
  stepperTab: 'calc(100vh - 395px)',
  compact: 'calc(100vh - 570px)',
} as const;

export type DataTableMode = keyof typeof DATA_TABLE_MODE_HEIGHTS;

// Whether any row has a value for a drawn series
export function hasSeriesValues(view: { rows: Record<string, unknown>[]; series: { id: string }[] } | null): boolean {
  return !!view && view.rows.some((row) => view.series.some((series) => row[series.id] != null));
}

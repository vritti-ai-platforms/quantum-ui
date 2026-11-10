import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CHART_SERIES_COLORS, colorSeries } from './colorSeries';

const series = (...ids: string[]) => ids.map((id) => ({ id, label: id.toUpperCase() }));

describe('colorSeries', () => {
  it('gives new series the palette in order', () => {
    const slots = new Map<string, number>();
    const colored = colorSeries(series('a', 'b'), slots);
    assert.deepEqual(
      colored.map((entry) => [entry.id, entry.slot, entry.color]),
      [
        ['a', 0, CHART_SERIES_COLORS[0]],
        ['b', 1, CHART_SERIES_COLORS[1]],
      ],
    );
  });

  it('keeps a series on its colour when another is filtered out, and reuses the freed slot', () => {
    const slots = new Map<string, number>();
    colorSeries(series('a', 'b', 'c'), slots);
    const afterFilter = colorSeries(series('a', 'c'), slots);
    assert.deepEqual(
      afterFilter.map((entry) => [entry.id, entry.slot]),
      [
        ['a', 0],
        ['c', 2],
      ],
    );
    const withNew = colorSeries(series('a', 'c', 'd'), slots);
    assert.equal(withNew.find((entry) => entry.id === 'd')?.slot, 1);
  });

  it('keeps a series colour of its own without taking a slot', () => {
    const slots = new Map<string, number>();
    const colored = colorSeries(
      [{ id: 'failed', label: 'Failed', color: 'var(--color-destructive)' }, ...series('a')],
      slots,
    );
    assert.deepEqual(
      colored.map((entry) => [entry.id, entry.slot, entry.color]),
      [
        ['failed', -1, 'var(--color-destructive)'],
        ['a', 0, CHART_SERIES_COLORS[0]],
      ],
    );
  });

  it('leaves out series past the palette', () => {
    const ids = Array.from({ length: CHART_SERIES_COLORS.length + 2 }, (_, index) => `s${index}`);
    assert.equal(colorSeries(series(...ids), new Map()).length, CHART_SERIES_COLORS.length);
  });
});

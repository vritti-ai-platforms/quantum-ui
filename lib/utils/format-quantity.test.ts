import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { type DisplayQuantity, formatQuantity } from './format';

const options = { localeTag: 'en-US' };

const strips = (primaryUomQty: number, whole: number, remainder: number): DisplayQuantity => ({
  primaryUomQty,
  displayUomQty: primaryUomQty / 10,
  wholeDisplayUomQty: whole,
  remainderPrimaryUomQty: remainder,
  displayUomSymbol: 'strip',
  primaryUomSymbol: 'tab',
  isPack: true,
});

describe('formatQuantity', () => {
  it('shows whole packs plus the primary units left over, with the total as the secondary', () => {
    assert.deepEqual(formatQuantity(strips(2344, 234, 4), options), {
      primary: '234 strip + 4 tab',
      secondary: '2,344 tab',
    });
  });

  it('shows whole packs alone when nothing is left over', () => {
    assert.deepEqual(formatQuantity(strips(2340, 234, 0), options), { primary: '234 strip', secondary: '2,340 tab' });
  });

  it('shows nothing in the display unit', () => {
    assert.deepEqual(formatQuantity(strips(0, 0, 0), options), { primary: '0 strip' });
  });

  it('shows primary units alone when there is less than one pack', () => {
    assert.deepEqual(formatQuantity(strips(4, 0, 4), options), { primary: '4 tab' });
  });

  it('subtracts the leftover of a negative quantity', () => {
    assert.deepEqual(formatQuantity(strips(-25, -2, -5), options), {
      primary: '-2 strip − 5 tab',
      secondary: '-25 tab',
    });
  });

  it('shows a derived unit as one figure', () => {
    assert.deepEqual(
      formatQuantity(
        {
          primaryUomQty: 12500,
          displayUomQty: 12.5,
          wholeDisplayUomQty: 12,
          remainderPrimaryUomQty: 500,
          displayUomSymbol: 'kg',
          primaryUomSymbol: 'g',
          isPack: false,
        },
        options,
      ),
      { primary: '12.5 kg', secondary: '12,500 g' },
    );
  });

  it('shows the primary unit alone when the item displays in it', () => {
    assert.deepEqual(
      formatQuantity(
        {
          primaryUomQty: 2344,
          displayUomQty: 2344,
          wholeDisplayUomQty: 2344,
          remainderPrimaryUomQty: 0,
          displayUomSymbol: 'tab',
          primaryUomSymbol: 'tab',
          isPack: false,
        },
        options,
      ),
      { primary: '2,344 tab' },
    );
  });

  it('shows a dash for a missing quantity', () => {
    assert.deepEqual(formatQuantity(null, options), { primary: '—' });
  });
});

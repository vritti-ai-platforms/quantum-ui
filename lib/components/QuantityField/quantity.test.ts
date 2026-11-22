import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  breakDownQty,
  entryUnits,
  fromPrimaryQty,
  partsOfQty,
  type QuantityUnit,
  quantityPlaceholder,
  resolveQuantityMessage,
  sumParts,
  toDisplayQuantity,
  toPrimaryQty,
} from './quantity';

const tablet: QuantityUnit = { id: 'tab', name: 'Tablet', symbol: 'tab', primaryUomQty: 1, uomQty: 1 };
const strip: QuantityUnit = { id: 'strip', name: 'Strip', symbol: 'strip', primaryUomQty: 10, uomQty: 1 };
const box: QuantityUnit = { id: 'box', name: 'Box', symbol: 'box', primaryUomQty: 100, uomQty: 1 };
const pack: QuantityUnit = { id: 'pack', name: 'Pack', symbol: 'pack', primaryUomQty: 5, uomQty: 2 };
const units = [tablet, strip, box];
const format = (value: number) => value.toLocaleString('en-US');
const pouch: QuantityUnit = { id: 'pouch', name: 'Pouch', symbol: 'pouch', primaryUomQty: 15, uomQty: 1 };
const ml: QuantityUnit = { id: 'ml', name: 'Millilitre', symbol: 'ml', primaryUomQty: 1, uomQty: 1, isPack: false };
const litre: QuantityUnit = { id: 'l', name: 'Litre', symbol: 'L', primaryUomQty: 1000, uomQty: 1, isPack: false };
const bottle: QuantityUnit = { id: 'bottle', name: 'Bottle', symbol: 'bottle', primaryUomQty: 100, uomQty: 1 };
const read = (qty: number, anchor: string, list = units, cascade = true, primary = 'tab') =>
  breakDownQty(qty, list, anchor, primary, cascade).map((piece) => `${piece.amount.toFixed()} ${piece.unit.symbol}`);

describe('breakDownQty', () => {
  it('breaks the rest down through every smaller pack when cascading, largest first', () => {
    assert.deepEqual(read(952, 'box'), ['9 box', '5 strip', '2 tab']);
    assert.deepEqual(read(952, 'strip'), ['95 strip', '2 tab']);
  });

  it('keeps the anchor packs and the primary units left over when not cascading', () => {
    assert.deepEqual(read(952, 'box', units, false), ['9 box', '52 tab']);
  });

  it('skips a pack that does not fit evenly into the one above it', () => {
    assert.deepEqual(read(952, 'box', [tablet, strip, pouch, box]), ['9 box', '5 strip', '2 tab']);
  });

  it('never uses units larger than the anchor', () => {
    assert.deepEqual(read(1205, 'strip'), ['120 strip', '5 tab']);
  });

  it('puts everything in the primary unit when that is the anchor, decimals included', () => {
    assert.deepEqual(read(12.5, 'tab'), ['12.5 tab']);
  });

  it('handles packs that are not a whole number of primary units', () => {
    assert.deepEqual(read(7, 'pack', [tablet, pack]), ['2 pack', '2 tab']);
  });

  it('reads a family unit as one exact figure and never breaks down through one', () => {
    const syrup = [ml, litre, bottle];
    assert.deepEqual(read(2500, 'l', syrup, true, 'ml'), ['2.5 L']);
    assert.deepEqual(read(250.5, 'bottle', syrup, true, 'ml'), ['2 bottle', '50.5 ml']);
  });
});

describe('toDisplayQuantity', () => {
  it('reads a quantity in a pack display unit with its breakdown', () => {
    assert.deepEqual(toDisplayQuantity(952, units, 'tab', 'box', true), {
      primaryUomQty: 952,
      displayUomQty: 9.52,
      wholeDisplayUomQty: 9,
      remainderPrimaryUomQty: 52,
      displayUomSymbol: 'box',
      primaryUomSymbol: 'tab',
      isPack: true,
      breakdown: [
        { qty: 9, symbol: 'box' },
        { qty: 5, symbol: 'strip' },
        { qty: 2, symbol: 'tab' },
      ],
    });
    assert.deepEqual(toDisplayQuantity(952, units, 'tab', 'box')?.breakdown, [
      { qty: 9, symbol: 'box' },
      { qty: 52, symbol: 'tab' },
    ]);
  });

  it('reads a family display unit as one figure, without a breakdown', () => {
    const value = toDisplayQuantity(2500, [ml, litre, bottle], 'ml', 'l', true);
    assert.equal(value?.displayUomQty, 2.5);
    assert.equal(value?.isPack, false);
    assert.deepEqual(value?.breakdown, []);
  });

  it('gives null until the primary unit is known', () => {
    assert.equal(toDisplayQuantity(10, [], 'tab', 'strip'), null);
  });
});

describe('entryUnits', () => {
  it('takes entries in the packs and the primary unit, plus a family unit only while it is the anchor', () => {
    const syrup = [ml, litre, bottle];
    assert.deepEqual(
      entryUnits(syrup, 'ml', 'bottle').map((unit) => unit.id),
      ['bottle', 'ml'],
    );
    assert.deepEqual(
      entryUnits(syrup, 'ml', 'l').map((unit) => unit.id),
      ['l', 'bottle', 'ml'],
    );
  });
});

describe('sumParts', () => {
  it('adds the amounts of every unit into the primary unit', () => {
    assert.equal(sumParts({ box: '10', strip: '20', tab: '5' }, units), 1205);
    assert.equal(sumParts({ pack: '3' }, [tablet, pack]), 7.5);
  });

  it('gives undefined when nothing is typed', () => {
    assert.equal(sumParts({}, units), undefined);
    assert.equal(sumParts({ box: '', strip: '' }, units), undefined);
  });

  it('keeps an explicit zero', () => {
    assert.equal(sumParts({ strip: '0' }, units), 0);
  });
});

describe('partsOfQty', () => {
  it('enters a quantity as its breakdown, leaving out zero shares', () => {
    assert.deepEqual(partsOfQty(905, units, 'box', 'tab', true), { box: '9', tab: '5' });
    assert.deepEqual(partsOfQty(952, units, 'box', 'tab'), { box: '9', tab: '52' });
    assert.deepEqual(partsOfQty(400, units, 'strip', 'tab'), { strip: '40' });
  });

  it('enters it all in the primary unit while the anchor is a family unit', () => {
    assert.deepEqual(partsOfQty(2500, [ml, litre, bottle], 'l', 'ml'), { ml: '2500' });
  });

  it('gives nothing for a missing quantity', () => {
    assert.deepEqual(partsOfQty(null, units, 'strip', 'tab'), {});
    assert.deepEqual(partsOfQty(0, units, 'strip', 'tab'), { strip: '0' });
  });
});

describe('toPrimaryQty', () => {
  it('multiplies whole and fractional packs out to the primary unit', () => {
    assert.equal(toPrimaryQty('3', strip), 30);
    assert.equal(toPrimaryQty('2.5', strip), 25);
    assert.equal(toPrimaryQty('1.234', box), 123.4);
  });

  it('keeps an amount typed in the primary unit', () => {
    assert.equal(toPrimaryQty('42', tablet), 42);
  });

  it('gives undefined for empty or unreadable text', () => {
    assert.equal(toPrimaryQty('', strip), undefined);
    assert.equal(toPrimaryQty('-', strip), undefined);
  });
});

describe('fromPrimaryQty', () => {
  it('writes a primary quantity in packs without trailing zeros', () => {
    assert.equal(fromPrimaryQty(25, strip), '2.5');
    assert.equal(fromPrimaryQty(300, box), '3');
  });

  it('gives empty text for a missing quantity', () => {
    assert.equal(fromPrimaryQty(undefined, strip), '');
    assert.equal(fromPrimaryQty(null, strip), '');
  });
});

describe('resolveQuantityMessage', () => {
  it('shows named quantities in the unit being entered and names the primary unit', () => {
    assert.equal(
      resolveQuantityMessage(`Must be at most the reorder point (${quantityPlaceholder(1000)})`, strip, tablet, format),
      'Must be at most the reorder point (100 strip)',
    );
    assert.equal(
      resolveQuantityMessage('Must come to a whole number of {{primaryUnit}}', strip, tablet, format),
      'Must come to a whole number of tab',
    );
  });

  it('leaves a message without placeholders as it is', () => {
    assert.equal(resolveQuantityMessage('Required', strip, tablet, format), 'Required');
  });
});

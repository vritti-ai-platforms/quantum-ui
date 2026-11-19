import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  fromPrimaryQty,
  type QuantityUnit,
  quantityPlaceholder,
  resolveQuantityMessage,
  toPrimaryQty,
} from './quantity';

const tablet: QuantityUnit = { id: 'tab', name: 'Tablet', symbol: 'tab', primaryUomQty: 1, uomQty: 1 };
const strip: QuantityUnit = { id: 'strip', name: 'Strip', symbol: 'strip', primaryUomQty: 10, uomQty: 1 };
const box: QuantityUnit = { id: 'box', name: 'Box', symbol: 'box', primaryUomQty: 100, uomQty: 1 };
const format = (value: number) => value.toLocaleString('en-US');

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

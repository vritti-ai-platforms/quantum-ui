import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isCurrencyCode } from './currencyCode';

describe('isCurrencyCode', () => {
  it('takes the ISO currencies dinero carries', () => {
    assert.equal(isCurrencyCode('INR'), true);
    assert.equal(isCurrencyCode('OMR'), true);
  });

  it('takes the currencies added beside dinero', () => {
    assert.equal(isCurrencyCode('ANG'), true);
    assert.equal(isCurrencyCode('XAU'), true);
  });

  it('refuses anything else', () => {
    assert.equal(isCurrencyCode('inr'), false);
    assert.equal(isCurrencyCode('ABC'), false);
    assert.equal(isCurrencyCode(''), false);
    assert.equal(isCurrencyCode(undefined), false);
    assert.equal(isCurrencyCode(356), false);
    assert.equal(isCurrencyCode('constructor'), false);
    assert.equal(isCurrencyCode('toString'), false);
  });
});

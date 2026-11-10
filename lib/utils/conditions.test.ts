import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { FilterCondition } from '../types/conditions';
import { hasEveryDefault, holdsResetDefaults, readValue, readValues, withChange, withDefaults } from './conditions';

const site: FilterCondition = { field: 'site', operator: 'equals', value: 'site-1' };
const otherSite: FilterCondition = { field: 'site', operator: 'equals', value: 'site-2' };
const period: FilterCondition = { field: 'period', operator: 'between', value: ['2026-09-01', '2026-12-01'] };
const suppliers: FilterCondition = { field: 'supplierIds', operator: 'isAnyOf', value: ['a', 'b'] };

describe('withDefaults', () => {
  it('fills a missing field and keeps a saved one', () => {
    assert.deepEqual(withDefaults([otherSite], [site, period]), [otherSite, period]);
  });

  it('replaces a saved value with a reset-on-open default only while opening', () => {
    assert.deepEqual(withDefaults([otherSite], [site], { isOpening: true, resetOnOpen: ['site'] }), [site]);
    assert.deepEqual(withDefaults([otherSite], [site], { resetOnOpen: ['site'] }), [otherSite]);
  });

  it('returns the same array when nothing is missing', () => {
    const context = [site, period];
    assert.equal(withDefaults(context, [site]), context);
  });
});

describe('withChange', () => {
  it('sets a field and clears the fields that depend on it', () => {
    assert.deepEqual(withChange([site, suppliers, period], 'site', otherSite, ['supplierIds']), [period, otherSite]);
  });

  it('clears a field set to null', () => {
    assert.deepEqual(withChange([site, period], 'site', null, []), [period]);
  });
});

describe('readValue and readValues', () => {
  it('reads a single value, and a list as a list', () => {
    assert.equal(readValue([site], 'site'), 'site-1');
    assert.equal(readValue([suppliers], 'supplierIds'), undefined);
    assert.deepEqual(readValues([suppliers], 'supplierIds'), ['a', 'b']);
    assert.deepEqual(readValues([site], 'site'), ['site-1']);
    assert.deepEqual(readValues([], 'site'), []);
  });
});

describe('hasEveryDefault and holdsResetDefaults', () => {
  it('tells whether each default has a value', () => {
    assert.equal(hasEveryDefault([site, period], [site, period]), true);
    assert.equal(hasEveryDefault([otherSite], [site, period]), false);
  });

  it('tells whether every reset-on-open field holds its default exactly', () => {
    assert.equal(holdsResetDefaults([site], [site], ['site']), true);
    assert.equal(holdsResetDefaults([otherSite], [site], ['site']), false);
    assert.equal(holdsResetDefaults([otherSite], [site], []), true);
  });
});

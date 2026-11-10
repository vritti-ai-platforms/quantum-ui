import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { FilterCondition } from '../types/conditions';
import { filter } from './filter';

describe('filter()', () => {
  it('equals', () => {
    assert.deepEqual(filter('site').equals('s-1'), { field: 'site', operator: 'equals', value: 's-1' });
  });

  it('notEquals', () => {
    assert.deepEqual(filter('qty').notEquals(3), { field: 'qty', operator: 'notEquals', value: 3 });
  });

  it('contains', () => {
    assert.deepEqual(filter('name').contains('para'), { field: 'name', operator: 'contains', value: 'para' });
  });

  it('notContains', () => {
    assert.deepEqual(filter('name').notContains('x'), { field: 'name', operator: 'notContains', value: 'x' });
  });

  it('gt', () => {
    assert.deepEqual(filter('qty').gt(5), { field: 'qty', operator: 'gt', value: 5 });
  });

  it('gte', () => {
    assert.deepEqual(filter('qty').gte(5), { field: 'qty', operator: 'gte', value: 5 });
  });

  it('lt', () => {
    assert.deepEqual(filter('validFrom').lt('2026-01-01'), {
      field: 'validFrom',
      operator: 'lt',
      value: '2026-01-01',
    });
  });

  it('lte', () => {
    assert.deepEqual(filter('unitPrice').lte({ currency: 'INR', value: '100' }), {
      field: 'unitPrice',
      operator: 'lte',
      value: { currency: 'INR', value: '100' },
    });
  });

  it('isAnyOf', () => {
    assert.deepEqual(filter('status').isAnyOf(['ACTIVE', 'PAUSED']), {
      field: 'status',
      operator: 'isAnyOf',
      value: ['ACTIVE', 'PAUSED'],
    });
  });

  it('isNotAnyOf', () => {
    assert.deepEqual(filter('status').isNotAnyOf(['ARCHIVED']), {
      field: 'status',
      operator: 'isNotAnyOf',
      value: ['ARCHIVED'],
    });
  });

  it('between', () => {
    assert.deepEqual(filter('validFrom').between('2026-01-01', '2026-03-31'), {
      field: 'validFrom',
      operator: 'between',
      value: ['2026-01-01', '2026-03-31'],
    });
  });

  it('builds conditions assignable to FilterCondition', () => {
    const conditions: FilterCondition[] = [filter('status').isAnyOf(['ACTIVE']), filter('site').equals('s-1')];
    assert.equal(conditions.length, 2);
    // @ts-expect-error contains takes a string
    filter('name').contains(5);
    // @ts-expect-error isAnyOf takes a string array
    filter('status').isAnyOf('ACTIVE');
  });
});

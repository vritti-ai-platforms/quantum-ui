import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ContextStateInstance } from '../ContextBar/useContextState';
import type { SelectProps } from './Select';
import type { SelectFilterProps } from './SelectFilter';
import type { AdditionalKeysOf, SelectedOption, SelectFieldKeys, SelectOption } from './types';

// Compile-time checks: this file only has to type-check (`pnpm typecheck` covers it); the runtime test is a placeholder

type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
function expectType<T extends true>(_: T): void {}

interface SupplierFields {
  code: string;
  currencyCode: 'INR' | 'USD';
  currencyCodes: ('INR' | 'USD')[];
  purchasingBlocked: boolean;
}
const KEYS = 'currencyCode, currencyCodes' as const;

expectType<Equals<AdditionalKeysOf<typeof KEYS>, 'currencyCode' | 'currencyCodes'>>(true);
expectType<Equals<AdditionalKeysOf<'code'>, 'code'>>(true);
expectType<Equals<AdditionalKeysOf<''>, never>>(true);

// The picked option holds exactly the fields asked for, present and typed
type Picked = SelectedOption<SupplierFields, typeof KEYS>;
expectType<Equals<Picked['additionals'], { currencyCode: 'INR' | 'USD'; currencyCodes: ('INR' | 'USD')[] }>>(true);

const single: SelectProps<SupplierFields, typeof KEYS> = {
  fieldKeys: { additionalKeys: KEYS },
  onOptionSelect: (option) => {
    const code: 'INR' | 'USD' | undefined = option?.additionals.currencyCode;
    // @ts-expect-error a field the keys did not ask for is not on the option
    option?.additionals.purchasingBlocked;
    return code;
  },
};

const multiple: SelectProps<SupplierFields, typeof KEYS> = {
  multiple: true,
  fieldKeys: { additionalKeys: KEYS },
  onOptionsSelect: (options) => options.map((option) => option.additionals.currencyCodes),
};

// @ts-expect-error a key that is not a field of the endpoint does not compile
const typo: SelectFieldKeys<SupplierFields, 'currencyCod'> = { additionalKeys: 'currencyCod' };

// @ts-expect-error a plain string of keys does not compile — the keys must be a literal
const widened: SelectFieldKeys<SupplierFields, string> = { additionalKeys: 'currencyCode' };

const filter: SelectFilterProps<SupplierFields, typeof KEYS> = {
  name: 'supplierId',
  fieldKeys: { additionalKeys: KEYS },
  transformDescription: (description, option) => `${description} ${option.additionals.currencyCode}`,
};

// A context holds its select's typed options, and an option with no fields has none to read
function readsOf(
  context: ContextStateInstance<SelectedOption<SupplierFields, typeof KEYS>>,
  plain: SelectOption,
): 'INR' | 'USD' | undefined {
  // @ts-expect-error
  plain.additionals?.currencyCode;
  return context.selectedOption?.additionals.currencyCode;
}

// A page's context may hold a narrower view of the select's options — the fields it reads
function narrowContext(view: ContextStateInstance<SelectOption<Pick<SupplierFields, 'currencyCode'>>>) {
  const props: SelectProps<SupplierFields, typeof KEYS> = { context: view };
  return props;
}

// A select asking with one of two key lists returns one shape per list: a field only the longer list asks for is read
// after checking for it
const PRICED_KEYS = 'currencyCode,purchasingBlocked' as const;
function pricedRead(option: SelectedOption<SupplierFields, typeof KEYS | typeof PRICED_KEYS>): boolean {
  // @ts-expect-error not every shape carries it
  option.additionals.purchasingBlocked;
  return 'purchasingBlocked' in option.additionals ? option.additionals.purchasingBlocked : false;
}

describe('Select additionals types', () => {
  it('type-checks', () => {
    assert.ok([single, multiple, typo, widened, filter, readsOf, narrowContext, pricedRead].length > 0);
  });
});

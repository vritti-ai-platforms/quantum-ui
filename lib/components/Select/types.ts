export type SelectValue = string | number | boolean | null;

// The extra fields of an option that asks for none
export type NoSelectFields = Record<never, never>;

// An option with the extra fields its endpoint returns for the additionalKeys asked for; an option with none has no
// fields to read
export type SelectOption<TAdditionals extends object = NoSelectFields> = {
  value: SelectValue;
  label: string;
  description?: string;
  disabled?: boolean;
  groupId?: string | number;
} & (NoSelectFields extends TAdditionals ? { additionals?: TAdditionals } : { additionals: TAdditionals });

// Any option, whatever its extra fields — what the select's internals hold
export type AnySelectOption = SelectOption<object>;

type TrimKey<S extends string> = S extends ` ${infer Rest}`
  ? TrimKey<Rest>
  : S extends `${infer Rest} `
    ? TrimKey<Rest>
    : S;

// The keys a comma-separated additionalKeys list names: 'code,currencyCode' → 'code' | 'currencyCode'
export type AdditionalKeysOf<S extends string> = S extends `${infer Head},${infer Rest}`
  ? TrimKey<Head> | AdditionalKeysOf<Rest>
  : S extends ''
    ? never
    : TrimKey<S>;

// The keys list itself when it is a literal naming only fields of TFields, never otherwise — so a plain string, a typo
// or a field the endpoint does not return fails to compile
export type KnownAdditionalKeys<TFields extends object, TKeys extends string> = string extends TKeys
  ? never
  : AdditionalKeysOf<TKeys> extends keyof TFields
    ? TKeys
    : never;

// The option a select of TFields returns for the additionalKeys TKeys: those fields only; with no keys, TFields itself
// (a static list's own fields). A union of key lists gives one option shape per list; a picker that asks with
// different lists gives each its own mode, so each mode's option is a single shape
export type SelectedOption<TFields extends object, TKeys extends string> = [TKeys] extends [never]
  ? SelectOption<TFields>
  : OptionPerKeyList<TFields, TKeys>;

type OptionPerKeyList<TFields extends object, TKeys extends string> = TKeys extends string
  ? SelectOption<Pick<TFields, Extract<AdditionalKeysOf<TKeys>, keyof TFields>>>
  : never;

export interface SelectGroup {
  id: string | number;
  name: string;
}

export interface SelectOptionsResponse {
  options: AnySelectOption[];
  groups?: SelectGroup[];
  hasMore: boolean;
}

export interface AsyncSelectState {
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  searchQuery: string;
  /** The options don't answer the typed search yet — it waits out the debounce or is being fetched */
  searching: boolean;
  setSearchQuery: (q: string) => void;
  sentinelRef: (node?: Element | null) => void;
}

export type FilterOperator = string;

export interface FilterResult {
  field: string;
  operator: FilterOperator;
  value: string | number | string[];
}

// Which response fields fill an option, as the select's internals pass them on
export interface AnySelectFieldKeys {
  valueKey?: string;
  labelKey?: string;
  descriptionKey?: string;
  additionalKeys?: string;
  groupIdKey?: string;
}

// Which response fields fill an option; additionalKeys must name fields of TFields (checked by KnownAdditionalKeys)
export interface SelectFieldKeys<TFields extends object = NoSelectFields, TKeys extends string = never> {
  valueKey?: string;
  labelKey?: string;
  descriptionKey?: string;
  additionalKeys?: TKeys & KnownAdditionalKeys<TFields, TKeys>;
  groupIdKey?: string;
}

import type { AxiosInstance } from 'axios';
import type { ReactNode, SyntheticEvent } from 'react';

/**
 * Option type for SingleSelect
 */
export interface Option {
  /**
   * Display label for the option
   */
  label: string;

  /**
   * Secondary label displayed below the main label
   */
  subLabel?: string;

  /**
   * The value of the option (can be any type)
   */
  value: unknown;

  /**
   * Optional icon to display alongside the option
   */
  icon?: ReactNode;
}

/**
 * State shape for SingleSelect reducer
 */
export interface SingleSelectState {
  /**
   * Whether the dropdown is open
   */
  open: boolean;

  /**
   * Loading state for pagination/search operations
   */
  loadingInternalOptions: boolean;

  /**
   * Loading state for initial selected value fetch
   */
  loadingInitialInternalOptions: boolean;

  /**
   * Current array of options
   */
  internalOptions: Option[];

  /**
   * Hash map of options by value for O(1) lookups
   */
  internalOptionsMap: Record<string, Option>;

  /**
   * Page size for pagination
   */
  limit: number;

  /**
   * Current pagination offset
   */
  offset: number;

  /**
   * Whether more pages are available
   */
  hasMore: boolean;

  /**
   * Current search term
   */
  search: string | null;

  /**
   * Network error state
   */
  error?: unknown;
}

/**
 * Action types for SingleSelect reducer
 */
export const SingleSelectActionType = {
  OPEN: 'open',
  CLOSE: 'close',
  LOAD_INTERNAL_OPTIONS_START: 'load_internal_options_start',
  LOAD_INTERNAL_OPTIONS_END: 'load_internal_options_end',
  LOAD_SELECTED_OPTIONS_START: 'load_selected_options_start',
  LOAD_SELECTED_OPTIONS_END: 'load_selected_options_end',
  SET_NETWORK_ERROR: 'set_network_error',
  SET_INTERNAL_OPTIONS: 'set_internal_options',
  APPEND_INTERNAL_OPTIONS: 'append_internal_options',
  CHANGE_HAS_MORE_FLAG: 'change_has_more_flag',
  SET_SEARCH: 'set_search',
  CLEAR_SEARCH: 'clear_search',
} as const;

export type SingleSelectActionType = (typeof SingleSelectActionType)[keyof typeof SingleSelectActionType];

/**
 * Action shape for SingleSelect reducer
 */
export interface SingleSelectAction {
  actionType: SingleSelectActionType;
  stateChanges?: Partial<SingleSelectState> & {
    persistOffset?: boolean;
    newOptions?: Option[];
  };
}

/**
 * Database value mapping properties
 */
export interface DbValueProps {
  /**
   * Field name to use as the value
   */
  valueKey: string;

  /**
   * Whether the value is a MongoDB ObjectId
   */
  isObjectId?: boolean;

  /**
   * Whether to parse the value as an integer
   */
  isInt?: boolean;

  /**
   * Whether to parse the value as a float
   */
  isFloat?: boolean;
}

/**
 * Database label mapping properties
 */
export interface DbLabelProps {
  /**
   * Field name to use as the primary label
   */
  labelKey: string;

  /**
   * Field name to use as the secondary label
   */
  subLabelKey?: string;

  /**
   * Whether to transform label to Start Case
   */
  useLabelStartCase?: boolean;

  /**
   * Whether to transform subLabel to Start Case
   */
  useSubLabelStartCase?: boolean;

  /**
   * Search term for server-side filtering
   */
  search?: string;
}

/**
 * Props for the SingleSelect component
 */
export interface SingleSelectProps {
  /**
   * Static options array
   */
  options?: Option[];

  /**
   * API endpoint for dynamic options loading
   */
  optionsApiEndPoint?: string;

  /**
   * Additional parameters for API requests
   */
  optionsApiEndpointParams?: Record<string, unknown>;

  /**
   * Custom axios instance for API calls
   */
  externalAxios?: AxiosInstance;

  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Label for the select
   */
  label?: string;

  /**
   * Name attribute for form integration
   */
  name?: string;

  /**
   * Function to extract value from option object
   */
  getValue?: (option: Option) => unknown;

  /**
   * Currently selected value
   */
  value?: unknown;

  /**
   * Default value for uncontrolled usage
   */
  defaultValue?: unknown;

  /**
   * Placeholder text shown when no value is selected
   */
  placeholder?: string;

  /**
   * Database value mapping properties
   */
  dbValueProps?: DbValueProps;

  /**
   * Database label mapping properties
   */
  dbLabelProps?: DbLabelProps;

  /**
   * Callback fired when selection changes
   */
  onChange?: (value: unknown) => void;

  /**
   * Callback when menu opens
   */
  onOpen?: (event: SyntheticEvent) => void;

  /**
   * Callback when menu closes
   */
  onClose?: (event: SyntheticEvent, reason: string) => void;

  /**
   * Error state (can be string or object with message property)
   */
  error?: string | { message?: string } | boolean;

  /**
   * Helper text to display below the field
   */
  helperText?: string;

  /**
   * Display type - input (form field) or filter (chip/badge)
   */
  type?: 'input' | 'filter';

  /**
   * Whether to hide the clear button
   */
  disableClear?: boolean;

  /**
   * Whether the select takes full width
   */
  fullWidth?: boolean;

  /**
   * Whether the select is disabled
   */
  disabled?: boolean;

  /**
   * Whether options are loading externally
   */
  loading?: boolean;
}

/**
 * Props for SingleInput component (internal)
 */
export interface SingleInputProps extends SingleSelectProps {
  /**
   * Callback when selection changes (required)
   */
  onChange: (value: unknown) => void;

  /**
   * Function to search database
   */
  searchDb: (searchValue: string) => Promise<void>;

  /**
   * Handler for dropdown open
   */
  handleOpen: (event: SyntheticEvent) => Promise<void>;

  /**
   * Handler for dropdown close
   */
  handleClose: (event: SyntheticEvent, reason: string) => void;

  /**
   * Handler for scroll events (pagination)
   */
  handleScroll: (event: React.UIEvent<HTMLFieldSetElement>) => Promise<void>;

  /**
   * Current reducer state
   */
  state: SingleSelectState;
}

/**
 * Props for SingleFilter component (internal)
 */
export interface SingleFilterProps extends SingleSelectProps {
  /**
   * Callback when selection changes (required)
   */
  onChange: (value: unknown) => void;

  /**
   * Function to search database
   */
  searchDb: (searchValue: string) => Promise<void>;

  /**
   * Handler for dropdown open
   */
  handleOpen: (event: SyntheticEvent) => Promise<void>;

  /**
   * Handler for dropdown close
   */
  handleClose: (event: SyntheticEvent, reason: string) => void;

  /**
   * Handler for scroll events (pagination)
   */
  handleScroll: (event: React.UIEvent<HTMLFieldSetElement>) => Promise<void>;

  /**
   * Current reducer state
   */
  state: SingleSelectState;
}

/**
 * Props for ComboboxList component (internal)
 */
export interface ComboboxListProps {
  /**
   * Current search value
   */
  searchValue: string;

  /**
   * Handler for search input changes
   */
  onSearchChange: (value: string) => void;

  /**
   * Array of options to display
   */
  options: Option[];

  /**
   * Currently selected value
   */
  selectedValue: unknown;

  /**
   * Handler when an option is selected
   */
  onSelect: (option: Option) => void;

  /**
   * Handler for scroll events (pagination)
   */
  onScroll?: (event: React.UIEvent<HTMLFieldSetElement>) => void | Promise<void>;

  /**
   * Whether options are loading
   */
  loading?: boolean;

  /**
   * Message to display when no options found
   */
  emptyMessage?: string;

  /**
   * Search input placeholder
   */
  searchPlaceholder?: string;

  /**
   * Whether the list should filter locally (client-side)
   */
  shouldFilter?: boolean;

  /**
   * Function to extract value from option for comparison
   */
  getValue?: (option: Option) => unknown;

  /**
   * Handler for keyboard escape
   */
  onEscape?: () => void;
}

/**
 * Props for MenuFooter component (internal)
 */
export interface MenuFooterProps {
  /**
   * Handler when clear button is clicked
   */
  onClick: () => void;
}

/**
 * Props for OptionsLoader component (internal)
 */
export interface OptionsLoaderProps {
  /**
   * Whether this is a search operation (vs pagination)
   */
  isSearch: boolean;
}

import type React from 'react';

const OPTION_SELECTOR = '[role="option"]:not([aria-disabled="true"])';
const SEARCH_SELECTOR = 'input[type="text"]';
const BUSY_LIST_SELECTOR = '[role="listbox"][aria-busy="true"]';

// What a select's panel holds and where focus is inside it
interface PanelFocus {
  options: HTMLElement[];
  search: HTMLInputElement | null;
  // Index of the focused option; -1 when focus is elsewhere (the search box, a button)
  activeIndex: number;
  isInSearch: boolean;
  // The list still shows an earlier search's results while the typed one loads
  isBusy: boolean;
}

function readPanel(panel: HTMLElement): PanelFocus {
  const options = Array.from(panel.querySelectorAll<HTMLElement>(OPTION_SELECTOR));
  const search = panel.querySelector<HTMLInputElement>(SEARCH_SELECTOR);
  const active = document.activeElement;
  return {
    options,
    search,
    activeIndex: active instanceof HTMLElement ? options.indexOf(active) : -1,
    isInSearch: active !== null && active === search,
    isBusy: panel.querySelector(BUSY_LIST_SELECTOR) !== null,
  };
}

// Where an arrow, Home or End key moves focus; null when the key doesn't move it
function moveTarget(key: string, { options, search, activeIndex, isInSearch }: PanelFocus): HTMLElement | null {
  const first = options[0] ?? null;
  const last = options[options.length - 1] ?? null;
  switch (key) {
    case 'ArrowDown':
      return activeIndex < 0 ? first : (options[activeIndex + 1] ?? last);
    case 'ArrowUp':
      return activeIndex > 0 ? options[activeIndex - 1] : search;
    case 'Home':
      return isInSearch ? null : first;
    case 'End':
      return isInSearch ? null : last;
    default:
      return null;
  }
}

// Enter in the search box picks the first option — but not while the list still shows an earlier search's results.
// Enter on a focused option is the option's own, so it's left alone here.
function pickFirstFromSearch(event: React.KeyboardEvent, { options, isInSearch, isBusy }: PanelFocus) {
  if (!isInSearch) return;
  event.preventDefault();
  if (isBusy) return;
  options[0]?.click();
}

// Keyboard movement inside a select's panel: ↓/↑ walk the options (↓ from the search box enters the list, ↑ from the
// first option goes back to it), Home/End jump to the ends, and Enter in the search box picks the first option
export function handleOptionKeys(event: React.KeyboardEvent<HTMLElement>) {
  // Another handler took the key, or an Enter is ending an input-method composition
  if (event.defaultPrevented || event.nativeEvent.isComposing) return;

  const panel = readPanel(event.currentTarget);
  if (event.key === 'Enter') {
    pickFirstFromSearch(event, panel);
    return;
  }

  const target = moveTarget(event.key, panel);
  if (!target) return;
  event.preventDefault();
  target.focus();
  target.scrollIntoView({ block: 'nearest' });
}

// When a select's panel opens, focus goes to its search box, else its first option — not to a control above them
export function focusSearchOnOpen(event: Event) {
  const panel = event.currentTarget;
  if (!(panel instanceof HTMLElement)) return;
  const start = panel.querySelector<HTMLElement>(SEARCH_SELECTOR) ?? panel.querySelector<HTMLElement>(OPTION_SELECTOR);
  if (!start) return;
  event.preventDefault();
  start.focus();
}

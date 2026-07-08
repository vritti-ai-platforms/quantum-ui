import { Kbd } from '../../../shadcn/shadcnKbd/kbd';
import { cn } from '../../../shadcn/utils';

function isMac(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

const MAC_SYMBOLS: Record<string, string> = {
  mod: '⌘',
  meta: '⌘',
  cmd: '⌘',
  alt: '⌥',
  option: '⌥',
  shift: '⇧',
  ctrl: '⌃',
  control: '⌃',
  enter: '↵',
  return: '↵',
  escape: 'Esc',
  esc: 'Esc',
  backspace: '⌫',
  delete: '⌦',
  tab: '⇥',
  space: '␣',
};

const WIN_SYMBOLS: Record<string, string> = {
  mod: 'Ctrl',
  meta: 'Win',
  cmd: 'Win',
  alt: 'Alt',
  option: 'Alt',
  shift: 'Shift',
  ctrl: 'Ctrl',
  control: 'Ctrl',
  enter: 'Enter',
  return: 'Enter',
  escape: 'Esc',
  esc: 'Esc',
  backspace: '⌫',
  delete: 'Del',
  tab: 'Tab',
  space: 'Space',
};

export interface HotkeyDisplay {
  display: string;
  keys: string[];
}

export function formatHotkey(shortcut: string): HotkeyDisplay {
  const mac = isMac();
  const table = mac ? MAC_SYMBOLS : WIN_SYMBOLS;
  const keys = shortcut
    .toLowerCase()
    .split('+')
    .map((part) => table[part] ?? part.toUpperCase());
  return { display: keys.join(''), keys };
}

interface KbdGroupProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  shortcut: string;
}

export function KbdGroup({ shortcut, className, ...props }: KbdGroupProps) {
  const { keys } = formatHotkey(shortcut);
  return (
    <div data-slot="kbd-group" className={cn('inline-flex items-center gap-0.5', className)} {...props}>
      {keys.map((key, i) => (
        <>
          {i > 0 && <span className="text-current/40 text-[9px] select-none leading-none">+</span>}
          <Kbd
            key={key}
            className="bg-current/10 text-current border-current/20 shadow-none h-4.5 min-w-4.5 rounded-[3px] px-1 text-[9px] leading-none"
          >
            {key}
          </Kbd>
        </>
      ))}
    </div>
  );
}

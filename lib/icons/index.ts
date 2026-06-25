import iconNames from './icon-names.json';

// Supported icon families: lucide (web glyphs), sf (Apple SF Symbols), material (Android Material Symbols)
export type IconKind = 'lucide' | 'sf' | 'material';

// Pre-generated icon-name lists keyed by family (see scripts/generate-icon-names.mjs)
export const ICON_NAMES: Record<IconKind, string[]> = iconNames as Record<IconKind, string[]>;

// Lazily built lookup sets per family for O(1) membership checks
const ICON_NAME_SETS: Record<IconKind, Set<string>> = {
  lucide: new Set(ICON_NAMES.lucide),
  sf: new Set(ICON_NAMES.sf),
  material: new Set(ICON_NAMES.material),
};

// Returns whether the given value is a known icon name within the family
export function isIconName(kind: IconKind, value: string): boolean {
  return ICON_NAME_SETS[kind].has(value);
}

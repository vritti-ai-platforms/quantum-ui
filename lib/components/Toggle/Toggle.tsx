import {
  Toggle as ShadcnToggle,
  toggleVariants as shadcnToggleVariants,
} from '../../../shadcn/shadcnToggle';

/**
 * Toggle component - a two-state button that can be either on or off.
 *
 * @example
 * ```tsx
 * <Toggle aria-label="Toggle italic">
 *   <Italic className="h-4 w-4" />
 * </Toggle>
 *
 * <Toggle variant="outline">
 *   <Bold className="h-4 w-4" />
 * </Toggle>
 * ```
 */
export const Toggle = ShadcnToggle;

/**
 * Toggle variants for custom styling.
 * Can be used with `cn()` to create custom toggle styles.
 */
export const toggleVariants = shadcnToggleVariants;

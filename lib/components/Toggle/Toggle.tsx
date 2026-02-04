import { Toggle as ShadcnToggle, toggleVariants as shadcnToggleVariants } from '../../../shadcn/shadcnToggle';

/**
 * Toggle component - a two-state button for UI state changes (like toolbar buttons).
 *
 * **IMPORTANT: Toggle is NOT designed for form submission.**
 * - Toggle uses `pressed`/`onPressedChange` semantics (UI state, not form data)
 * - It doesn't provide `name`/`value` props required for form fields
 * - **For form-based on/off fields, use the `Switch` component instead**
 *
 * **Use Toggle for:**
 * - Toolbar buttons (bold, italic, underline in text editors)
 * - UI state toggles (show/hide panels, enable/disable features)
 * - Button-like interactions that don't need form submission
 *
 * **Use Switch for:**
 * - Form fields with on/off states
 * - Settings that need to be submitted with form data
 * - Fields that require validation and error display
 *
 * @example
 * ```tsx
 * // Toolbar button (Toggle) - CORRECT usage
 * <Toggle aria-label="Toggle italic" onPressedChange={setItalic}>
 *   <Italic className="h-4 w-4" />
 * </Toggle>
 *
 * // Form field (Switch) - CORRECT usage
 * <Form form={form} onSubmit={handleSubmit}>
 *   <Switch name="notifications" label="Enable notifications" />
 * </Form>
 *
 * // ❌ INCORRECT - Don't use Toggle in forms
 * <Form form={form} onSubmit={handleSubmit}>
 *   <Toggle>Notifications</Toggle> // Won't work - use Switch instead
 * </Form>
 * ```
 */
export const Toggle = ShadcnToggle;

/**
 * Toggle variants for custom styling.
 * Can be used with `cn()` to create custom toggle styles.
 */
export const toggleVariants = shadcnToggleVariants;

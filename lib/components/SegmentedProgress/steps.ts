// The ordinal ramp, taken by position: the first segment (earliest stage) takes step 1. Literal class names so Tailwind
// compiles them; positions past the ramp share its last step.
const STEP_CLASSES = [
  'bg-progress-step-1',
  'bg-progress-step-2',
  'bg-progress-step-3',
  'bg-progress-step-4',
  'bg-progress-step-5',
] as const;

export function stepClassAt(position: number): string {
  return STEP_CLASSES[Math.min(position, STEP_CLASSES.length - 1)];
}

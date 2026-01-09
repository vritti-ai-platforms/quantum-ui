import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { cn } from '../../../shadcn/utils';
import { TextField, type TextFieldProps } from '../TextField/TextField';

export interface PasswordFieldProps extends Omit<TextFieldProps, 'type' | 'endAdornment'> {
  /**
   * Whether to show password strength indicator
   */
  showStrengthIndicator?: boolean;

  /**
   * Whether to show password match indicator
   */
  showMatchIndicator?: boolean;

  /**
   * Password to match against (for confirm password fields)
   */
  matchPassword?: string;

  /**
   * Custom aria-label for the visibility toggle button
   */
  toggleAriaLabel?: string;
}

// Helper function to calculate password strength
const getPasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^A-Za-z0-9]/.test(password)) strength += 1;

  if (strength < 2) return { label: 'Weak', color: 'text-destructive', bgColor: 'bg-destructive', width: '25%' };
  if (strength < 4) return { label: 'Fair', color: 'text-warning', bgColor: 'bg-warning', width: '60%' };
  return { label: 'Strong', color: 'text-success', bgColor: 'bg-success', width: '100%' };
};

// PasswordField component - specialized TextField for password inputs
export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      showStrengthIndicator = false,
      showMatchIndicator = false,
      matchPassword,
      toggleAriaLabel,
      value = '',
      description,
      error,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const passwordStrength = getPasswordStrength(String(value));
    const passwordsMatch = matchPassword !== undefined && value !== '' && value === matchPassword;

    // Build enhanced description by stacking indicators and description separately
    const enhancedDescription = (
      <>
        {/* Password strength indicator */}
        {showStrengthIndicator && value && !error && (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground">Strength:</span>
              <span className={passwordStrength.color}>{passwordStrength.label}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1">
              <div
                className={cn('h-1 rounded-full transition-all duration-300', passwordStrength.bgColor)}
                style={{ width: passwordStrength.width }}
              />
            </div>
          </div>
        )}

        {/* Password match indicator */}
        {showMatchIndicator && passwordsMatch && !error && (
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-success" />
            <span className="text-[10px] text-success">Passwords match</span>
          </div>
        )}

        {/* Original description (e.g., from zod schema) */}
        {description}
      </>
    );

    const eyeIcon = (
      <button
        type="button"
        onClick={togglePasswordVisibility}
        aria-label={toggleAriaLabel || (showPassword ? 'Hide password' : 'Show password')}
        className="cursor-pointer"
      >
        {showPassword ? (
          <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <Eye className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
    );

    return (
      <TextField
        ref={ref}
        {...props}
        type={showPassword ? 'text' : 'password'}
        value={value}
        description={enhancedDescription}
        error={error}
        endAdornment={eyeIcon}
      />
    );
  },
);

PasswordField.displayName = 'PasswordField';

import type React from 'react';
import { useRef } from 'react';
import { Field, FieldError, FieldLabel } from '../Field';

export interface UploadFileProps {
  // Trigger element rendered as the clickable anchor
  anchor: React.ReactNode;
  // Allow multiple file selection (default: false, returns single File)
  multiple?: boolean;
  // File type filter (accepts all files by default)
  accept?: string;
  // Disable the file input
  disabled?: boolean;
  // Optional field label for Form usage
  label?: string;
  // Validation error injected by Form's Controller
  error?: string;
  // Field name for Form detection — Controller wraps when present
  name?: string;
  // Callback with selected File (single) or File[] (multiple)
  onChange: (files: File | File[]) => void;
}

// Headless file upload trigger wrapping a hidden input
export const UploadFile: React.FC<UploadFileProps> = ({
  anchor,
  multiple = false,
  accept,
  disabled,
  label,
  error,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Open native file picker
  function handleClick() {
    if (disabled) return;
    inputRef.current?.click();
  }

  // Forward selected files to consumer and reset input
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    if (multiple) {
      onChange(Array.from(fileList));
    } else {
      onChange(fileList[0]);
    }

    // Reset so the same file can be re-selected
    event.target.value = '';
  }

  return (
    <Field data-disabled={disabled}>
      {label && <FieldLabel>{label}</FieldLabel>}

      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        style={{ all: 'unset', display: 'inline-block', cursor: disabled ? 'default' : 'pointer' }}
      >
        {anchor}
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        disabled={disabled}
        onChange={handleChange}
        style={{ display: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
      />

      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
};

UploadFile.displayName = 'UploadFile';

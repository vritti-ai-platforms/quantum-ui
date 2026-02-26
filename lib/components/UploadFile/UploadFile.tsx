import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Camera, Upload, User, X } from 'lucide-react';
import { cn } from '../../../shadcn/utils';
import { Field, FieldError, FieldLabel } from '../Field';
import { Button } from '../Button';
import { FilePreview } from '../FilePreview';

// Preset anchor string values
type AnchorPreset = 'dropzone' | 'button' | 'avatar';

interface UploadFileBaseProps {
  // Trigger style — preset string or custom ReactNode (default: 'dropzone')
  anchor?: AnchorPreset | React.ReactNode;
  // Allow multiple file selection (default: false, returns single File)
  multiple?: boolean;
  // File type filter (accepts all files by default)
  accept?: string;
  // Disable the file input
  disabled?: boolean;
  // Optional field label
  label?: string;
  // Validation error message
  error?: string;
  // Primary text on the anchor (varies by anchor type)
  placeholder?: string;
  // Secondary descriptive text (e.g., "PNG, JPG up to 10MB")
  hint?: string;
  // Current file value — injected by Form Controller or passed directly
  value?: File | File[] | null;
}

// Standalone usage — onChange is required
interface UploadFileStandaloneProps extends UploadFileBaseProps {
  name?: never;
  onChange: (files: File | File[] | undefined) => void;
}

// Form usage — Controller injects onChange via name prop
interface UploadFileFormProps extends UploadFileBaseProps {
  name: string;
  onChange?: (files: File | File[] | undefined) => void;
}

export type UploadFileProps = UploadFileStandaloneProps | UploadFileFormProps;

// Circular avatar preview used by the avatar anchor preset
const AvatarPreview: React.FC<{ file: File; size: number }> = ({ file, size }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!objectUrl) return null;

  return (
    <img
      src={objectUrl}
      alt={file.name}
      className="rounded-full object-cover w-full h-full"
      style={{ width: size, height: size }}
    />
  );
};

// File upload trigger with optional preset anchors and built-in file preview
export const UploadFile: React.FC<UploadFileProps> = ({
  anchor = 'dropzone',
  multiple = false,
  accept,
  disabled,
  label,
  error,
  placeholder,
  hint,
  value,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize value to an array for consistent handling
  const files: File[] = !value ? [] : Array.isArray(value) ? value : [value];
  const hasFiles = files.length > 0;

  // True when using a preset string anchor (not a custom ReactNode)
  const isPreset = anchor === 'dropzone' || anchor === 'button' || anchor === 'avatar';

  // Opens the native file picker
  function handleClick() {
    if (disabled) return;
    inputRef.current?.click();
  }

  // Forwards selected files to consumer and resets input
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    if (multiple) {
      // Merge with existing files, avoiding duplicates by name+size
      const incoming = Array.from(fileList);
      const merged = [
        ...files,
        ...incoming.filter((f) => !files.some((e) => e.name === f.name && e.size === f.size)),
      ];
      onChange?.(merged);
    } else {
      onChange?.(fileList[0]);
    }

    // Reset so the same file can be re-selected
    event.target.value = '';
  }

  // Removes a specific file from the selection
  function handleRemove(file: File) {
    if (multiple) {
      const remaining = files.filter((f) => f !== file);
      onChange?.(remaining.length ? remaining : undefined);
    } else {
      onChange?.(undefined);
    }
  }

  // Renders the clickable anchor element based on the anchor prop
  function renderAnchor() {
    // Custom ReactNode — preserve original headless behaviour
    if (!isPreset) {
      return (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          style={{ all: 'unset', display: 'inline-block', cursor: disabled ? 'default' : 'pointer' }}
        >
          {anchor as React.ReactNode}
        </button>
      );
    }

    if (anchor === 'dropzone') {
      // In single mode with a file selected, the file row replaces the dropzone
      if (!multiple && hasFiles) return null;

      return (
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 transition-colors',
            disabled ? 'cursor-default opacity-50' : 'cursor-pointer hover:bg-muted/50',
          )}
        >
          <Upload className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {placeholder ?? 'Click or drag to upload'}
          </p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </button>
      );
    }

    if (anchor === 'button') {
      // In single mode with a file selected, the file row replaces the button
      if (!multiple && hasFiles) return null;

      return (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled}
        >
          <Upload className="h-4 w-4" />
          {placeholder ?? 'Upload file'}
        </Button>
      );
    }

    if (anchor === 'avatar') {
      const avatarSize = 80;
      const firstFile = files[0];
      const hasImage = hasFiles && firstFile.type.startsWith('image/');

      return (
        // Wrapper provides positioning context for the badge outside overflow-hidden
        <div className="relative inline-block" style={{ width: avatarSize, height: avatarSize }}>
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className={cn(
              'group relative h-full w-full overflow-hidden rounded-full bg-muted',
              disabled ? 'cursor-default opacity-50' : 'cursor-pointer',
            )}
          >
            {hasImage ? (
              <>
                <AvatarPreview file={firstFile} size={avatarSize} />
                {/* Camera overlay on hover */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </button>

          {/* Badge sits outside overflow-hidden so it's never clipped */}
          {!hasImage && (
            <div className="pointer-events-none absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary ring-2 ring-background">
              <Upload className="h-3 w-3 text-primary-foreground" />
            </div>
          )}
        </div>
      );
    }

    return null;
  }

  // Renders the file list below the anchor for preset anchors (not avatar)
  function renderFileList() {
    if (!isPreset || !hasFiles || anchor === 'avatar') return null;

    return (
      <div className="flex flex-col gap-2">
        {files.map((file) => (
          <div
            key={`${file.name}-${file.size}`}
            className="flex items-center gap-3 rounded-lg border border-dashed border-border p-3"
          >
            <FilePreview file={file} size={40} />
            <span className="flex-1 truncate text-sm">{file.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => handleRemove(file)}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Field data-disabled={disabled}>
      {label && <FieldLabel>{label}</FieldLabel>}

      {renderAnchor()}
      {renderFileList()}

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

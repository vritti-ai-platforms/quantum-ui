import { Camera, Image, Upload, User, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { cn } from '../../../shadcn/utils';
import { Button } from '../Button';
import { Field, FieldError, FieldLabel } from '../Field';
import { FilePreview } from '../FilePreview';

type AnchorPreset = 'dropzone' | 'button' | 'avatar' | 'logo';

interface UploadFileBaseProps {
  anchor?: AnchorPreset | React.ReactNode;
  multiple?: boolean;
  accept?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
  placeholder?: string;
  hint?: string;
  value?: File | File[] | null;
  /** URL of an already-persisted file (e.g. a saved avatar). Shown as the preview until a new file is picked. */
  previewUrl?: string;
  isLoading?: boolean;
}

interface UploadFileStandaloneProps extends UploadFileBaseProps {
  name?: never;
  onChange: (files: File | File[] | undefined) => void;
}

interface UploadFileFormProps extends UploadFileBaseProps {
  name: string;
  onChange?: (files: File | File[] | undefined) => void;
}

export type UploadFileProps = UploadFileStandaloneProps | UploadFileFormProps;

// Creates a revocable object URL for an image File; null for non-images or no file.
// Built during render, not in an effect, so the preview never flashes a placeholder first.
function useImageObjectUrl(file: File | undefined): string | null {
  const objectUrl = useMemo(() => (file?.type.startsWith('image/') ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    if (!objectUrl) return;
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  return objectUrl;
}

// File upload trigger with optional preset anchors and built-in file preview
export const UploadFile: React.FC<UploadFileProps> = ({
  anchor = 'dropzone',
  multiple = false,
  accept,
  className,
  disabled,
  label,
  error,
  placeholder,
  hint,
  value,
  previewUrl,
  onChange,
  isLoading,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize value to an array for consistent handling
  const files: File[] = !value ? [] : Array.isArray(value) ? value : [value];
  const hasFiles = files.length > 0;

  const firstFile: File | undefined = files[0];
  const selectedImageUrl = useImageObjectUrl(firstFile);
  // A picked file always wins; previewUrl only fills in when nothing is selected, so
  // picking a non-image never falls back to the stale remote image
  const imageSrc = hasFiles ? selectedImageUrl : (previewUrl ?? null);

  // True when using a preset string anchor (not a custom ReactNode)
  const isPreset = anchor === 'dropzone' || anchor === 'button' || anchor === 'avatar' || anchor === 'logo';
  // Both tile presets share one 80px picker; avatar crops to a circle, logo keeps the whole image in a square
  const isTile = anchor === 'avatar' || anchor === 'logo';

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
      const merged = [...files, ...incoming.filter((f) => !files.some((e) => e.name === f.name && e.size === f.size))];
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
            'flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors',
            error ? 'border-destructive' : 'border-border',
            disabled ? 'cursor-default opacity-50' : 'cursor-pointer hover:bg-muted/50',
          )}
        >
          {imageSrc ? (
            <img src={imageSrc} alt="" className="h-16 w-16 rounded object-cover" />
          ) : (
            <Upload className="h-6 w-6 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">{placeholder ?? 'Click or drag to upload'}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </button>
      );
    }

    if (anchor === 'button') {
      // In single mode with a file selected, the file row replaces the button
      if (!multiple && hasFiles) return null;

      return (
        <Button type="button" variant="outline" onClick={handleClick} disabled={disabled}>
          <Upload className="h-4 w-4" />
          {placeholder ?? 'Upload file'}
        </Button>
      );
    }

    if (isTile) {
      const avatarSize = 80;
      const isLogo = anchor === 'logo';
      const shape = isLogo ? 'rounded-lg' : 'rounded-full';
      const Placeholder = isLogo ? Image : User;

      return (
        // Wrapper provides positioning context for the badge outside overflow-hidden
        <div className="relative inline-block" style={{ width: avatarSize, height: avatarSize }}>
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className={cn(
              'group relative h-full w-full overflow-hidden bg-muted',
              shape,
              disabled ? 'cursor-default' : 'cursor-pointer',
              // A shown image is content, not an affordance — only dim the empty placeholder
              disabled && !imageSrc && 'opacity-50',
            )}
          >
            {imageSrc ? (
              <>
                <img
                  src={imageSrc}
                  alt={firstFile?.name ?? ''}
                  // A logo must stay whole, so it is contained; an avatar fills its circle
                  className={cn('w-full h-full', shape, isLogo ? 'object-contain' : 'object-cover')}
                  style={{ width: avatarSize, height: avatarSize }}
                />
                {/* Camera overlay on hover — omitted when read-only, since nothing can be picked */}
                {!disabled && (
                  <div
                    className={cn(
                      'absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100',
                      shape,
                    )}
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Placeholder className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </button>

          {/* Badge sits outside overflow-hidden so it's never clipped */}
          {!imageSrc && (
            <div className="pointer-events-none absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary ring-2 ring-background">
              <Upload className="h-3 w-3 text-primary-foreground" />
            </div>
          )}
        </div>
      );
    }

    return null;
  }

  // Renders the file list below the anchor for preset anchors (not the tile presets, which preview inline)
  function renderFileList() {
    if (!isPreset || !hasFiles || isTile) return null;

    return (
      <div className="flex flex-col gap-2">
        {files.map((file) => (
          <div
            key={`${file.name}-${file.size}`}
            className={cn(
              'relative overflow-hidden flex items-center gap-3 rounded-lg border border-dashed p-3',
              isLoading ? 'border-primary/40 animate-pulse' : 'border-border',
            )}
          >
            {isLoading && <div className="absolute inset-0 bg-primary/5" />}
            <div className="relative flex items-center gap-3 flex-1 min-w-0">
              <FilePreview file={file} size={40} />
              <div className="flex-1 min-w-0">
                <span className="block truncate text-sm">{file.name}</span>
                {isLoading && <span className="text-xs text-muted-foreground">Uploading...</span>}
              </div>
              {!isLoading && (
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
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    // Field is w-full by default; a tile is a fixed 80px square or circle, so it hugs its content
    // instead of claiming the whole row and pushing sibling content to the far edge
    <Field data-disabled={disabled} className={cn(isTile && 'w-fit', className)}>
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

import type { UseMutationResult } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { ArrowLeft, CheckCircle2, Download, Equal, FilePlus2, FileUp, RefreshCw, Upload } from 'lucide-react';
import { useCallback } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { utils, writeFile } from 'xlsx';
import { cn } from '../../../../shadcn/utils';
import type { DialogHandle } from '../../../hooks/useDialog';
import { axios } from '../../../utils/axios';
import { Badge } from '../../Badge';
import { Button } from '../../Button';
import { Dialog } from '../../Dialog';
import { DropdownMenu } from '../../DropdownMenu';
import { Form } from '../../Form';
import { UploadFile } from '../../UploadFile';
import type { ImportExportColumn } from '../types';

// --- Types ---

interface ValidatedRow {
  index: number;
  data: Record<string, string>;
  valid: boolean;
  errors: string[];
}

interface ImportResponse {
  success: boolean;
  message: string;
  created?: number;
  updated?: number;
  skipped?: number;
  rows?: ValidatedRow[];
  summary?: { total: number; valid: number; invalid: number };
}

interface DataTableImportDialogProps {
  handle: DialogHandle;
  columns: ImportExportColumn[];
  sampleData?: Record<string, string>[];
  importEndpoint: string;
  filename: string;
  onSuccess?: () => void;
}

interface UploadFormData {
  file: File;
}

const SAMPLE_FORMATS = [
  { id: 'csv', label: 'CSV (.csv)', ext: 'csv', bookType: 'csv' as const },
  { id: 'xlsx', label: 'Excel (.xlsx)', ext: 'xlsx', bookType: 'xlsx' as const },
  { id: 'xls', label: 'Excel 97-2004 (.xls)', ext: 'xls', bookType: 'biff8' as const },
  { id: 'ods', label: 'OpenDocument (.ods)', ext: 'ods', bookType: 'ods' as const },
  { id: 'tsv', label: 'TSV (.tsv)', ext: 'tsv', bookType: 'csv' as const },
];

// --- Step 1: Upload ---

interface UploadStepProps {
  form: UseFormReturn<UploadFormData>;
  importMutation: UseMutationResult<ImportResponse, AxiosError, File>;
  sampleData?: Record<string, string>[];
  filename: string;
}

function UploadStep({ form, importMutation, sampleData, filename }: UploadStepProps) {
  const downloadSample = useCallback(
    (formatId: string) => {
      if (!sampleData?.length) return;
      const format = SAMPLE_FORMATS.find((f) => f.id === formatId);
      if (!format) return;
      const ws = utils.json_to_sheet(sampleData);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Sample');
      const opts = formatId === 'tsv' ? { bookType: 'csv' as const, FS: '\t' } : { bookType: format.bookType };
      writeFile(wb, `${filename}-sample.${format.ext}`, opts);
    },
    [sampleData, filename],
  );

  return (
    <Form
      form={form}
      mutation={importMutation}
      transformSubmit={(data: UploadFormData) => data.file}
      resetOnSuccess={false}
    >
      <UploadFile
        name="file"
        label="File"
        accept=".csv,.xlsx,.xls,.ods,.tsv"
        placeholder="Drop a spreadsheet file"
        hint="Supported formats: CSV, Excel, ODS, TSV"
      />
      <div className="flex items-center justify-between pt-2">
        {sampleData?.length ? (
          <DropdownMenu
            trigger={{
              label: 'Download sample',
              variant: 'ghost',
              icon: Download,
              className: 'text-xs h-8',
            }}
            items={SAMPLE_FORMATS.map((f) => ({
              type: 'item' as const,
              id: f.id,
              label: f.label,
              onClick: () => downloadSample(f.id),
            }))}
          />
        ) : (
          <div />
        )}
        <Button type="submit" size="sm" isLoading={importMutation.isPending} loadingText="Importing...">
          <FileUp className="size-4 mr-1.5" />
          Import
        </Button>
      </div>
    </Form>
  );
}

// --- Step 2a: Success Summary ---

interface SuccessStepProps {
  result: ImportResponse;
  onClose: () => void;
}

function SuccessStep({ result, onClose }: SuccessStepProps) {
  const total = (result.created ?? 0) + (result.updated ?? 0) + (result.skipped ?? 0);

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center justify-center size-12 rounded-full bg-success/15 mb-1">
          <CheckCircle2 className="size-6 text-success" />
        </div>
        <p className="text-base font-semibold">{result.message}</p>
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? 'record' : 'records'} processed
        </p>
      </div>

      <div className="flex items-center justify-center gap-6">
        {(result.created ?? 0) > 0 && (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center size-8 rounded-lg bg-success/10">
              <FilePlus2 className="size-4 text-success" />
            </div>
            <div>
              <p className="text-xl font-semibold leading-none">{result.created}</p>
              <p className="text-xs text-muted-foreground mt-0.5">created</p>
            </div>
          </div>
        )}
        {(result.created ?? 0) > 0 && (result.updated ?? 0) > 0 && <div className="w-px h-8 bg-border" />}
        {(result.updated ?? 0) > 0 && (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
              <RefreshCw className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-semibold leading-none">{result.updated}</p>
              <p className="text-xs text-muted-foreground mt-0.5">updated</p>
            </div>
          </div>
        )}
        {(result.skipped ?? 0) > 0 && (
          <>
            {((result.created ?? 0) > 0 || (result.updated ?? 0) > 0) && <div className="w-px h-8 bg-border" />}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center size-8 rounded-lg bg-muted">
                <Equal className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl font-semibold leading-none">{result.skipped}</p>
                <p className="text-xs text-muted-foreground mt-0.5">unchanged</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end pt-1">
        <Button size="sm" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  );
}

// --- Step 2b: Error Summary ---

interface ErrorStepProps {
  result: ImportResponse;
  columns: ImportExportColumn[];
  onBack: () => void;
}

function ErrorStep({ result, columns, onBack }: ErrorStepProps) {
  const { summary, rows } = result;
  if (!summary || !rows) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{summary.total} total</Badge>
        <Badge variant="outline" className="text-success border-success/30 bg-success/10">
          {summary.valid} valid
        </Badge>
        {summary.invalid > 0 && (
          <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
            {summary.invalid} invalid
          </Badge>
        )}
      </div>

      <div className="max-h-80 overflow-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">#</th>
              {columns.map((col) => (
                <th key={col.key} className="px-3 py-2 text-left font-medium text-muted-foreground">
                  {col.label}
                </th>
              ))}
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Errors</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.index} className={cn(!row.valid && 'bg-destructive/5')}>
                <td className="px-3 py-2 text-muted-foreground">{row.index}</td>
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2">
                    {row.data[col.key] || <span className="text-muted-foreground">-</span>}
                  </td>
                ))}
                <td className="px-3 py-2 text-destructive text-xs">{row.errors.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-start">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="size-4 mr-1.5" />
          Back
        </Button>
      </div>
    </div>
  );
}

// --- Main Dialog ---

export function DataTableImportDialog({
  handle,
  columns,
  sampleData,
  importEndpoint,
  filename,
  onSuccess,
}: DataTableImportDialogProps) {
  const form = useForm<UploadFormData>();

  const importMutation = useMutation<ImportResponse, AxiosError, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post<ImportResponse>(importEndpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        showSuccessToast: false,
        showErrorToast: false,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) onSuccess?.();
    },
  });

  const result = importMutation.data ?? null;
  const isUploadStep = !result;

  function resetToUpload() {
    form.reset();
    importMutation.reset();
  }

  const dialogHandle: DialogHandle = {
    ...handle,
    close: () => {
      resetToUpload();
      handle.close();
    },
    onOpenChange: (value: boolean) => {
      if (!value) resetToUpload();
      handle.onOpenChange(value);
    },
  };

  const title = `Import ${filename}`;
  const description = isUploadStep
    ? 'Upload a CSV or Excel file.'
    : result?.success
      ? 'Import completed successfully.'
      : result?.summary
        ? `${result.summary.invalid} of ${result.summary.total} rows have errors. Fix the file and re-upload.`
        : undefined;

  return (
    <Dialog
      handle={dialogHandle}
      icon={Upload}
      title={title}
      description={description}
      className={!isUploadStep && result && !result.success ? 'max-w-3xl' : undefined}
      content={() => {
        if (isUploadStep) {
          return <UploadStep form={form} importMutation={importMutation} sampleData={sampleData} filename={filename} />;
        }
        if (result.success) {
          return <SuccessStep result={result} onClose={dialogHandle.close} />;
        }
        if (result && !result.success && result.rows && result.summary) {
          return <ErrorStep result={result} columns={columns} onBack={resetToUpload} />;
        }
        return null;
      }}
    />
  );
}

DataTableImportDialog.displayName = 'DataTableImportDialog';

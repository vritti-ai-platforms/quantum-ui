import { ScanBarcode } from 'lucide-react';
import type { UseBarcodeScannerResult } from '../../hooks/useBarcodeScanner';
import { Button } from '../Button';
import { KbdGroup } from '../Kbd';

export interface ScanBarcodeButtonProps {
  scanner: UseBarcodeScannerResult;
  disabled?: boolean;
  label?: string;
  loadingText?: string;
}

// Toggle button for a `useBarcodeScanner` reflecting its active/pending state and surfacing the toggle hotkey
export function ScanBarcodeButton({
  scanner,
  disabled,
  label = 'Scan Barcode',
  loadingText = 'Scanning...',
}: ScanBarcodeButtonProps) {
  return (
    <Button
      size="sm"
      variant={scanner.isActive ? 'default' : 'outline'}
      startAdornment={<ScanBarcode className="size-4" />}
      endAdornment={<KbdGroup className="ml-1" shortcut={scanner.toggleShortcut} />}
      onClick={scanner.toggle}
      disabled={disabled}
      isLoading={scanner.isPending}
      loadingText={loadingText}
    >
      {label}
    </Button>
  );
}

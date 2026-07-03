'use client';

import { TableIcon } from 'lucide-react';

import { useToolbarContext } from '../../context/toolbar-context';
import { Button } from '../../editor-ui/button';
import { InsertTableDialog } from '../table-plugin';

export function TableToolbarPlugin() {
  const { activeEditor, showModal } = useToolbarContext();

  return (
    <Button
      onClick={() =>
        showModal('Insert Table', (onClose) => <InsertTableDialog activeEditor={activeEditor} onClose={onClose} />)
      }
      size={'icon-sm'}
      variant={'outline'}
      className=""
    >
      <TableIcon className="size-4" />
    </Button>
  );
}

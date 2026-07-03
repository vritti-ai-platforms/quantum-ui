'use client';

import { ImageIcon } from 'lucide-react';

import { useToolbarContext } from '../../context/toolbar-context';
import { Button } from '../../editor-ui/button';
import { InsertImageDialog } from '../images-plugin';

export function ImageToolbarPlugin() {
  const { activeEditor, showModal } = useToolbarContext();

  return (
    <Button
      onClick={(_e) => {
        showModal('Insert Image', (onClose) => <InsertImageDialog activeEditor={activeEditor} onClose={onClose} />);
      }}
      variant={'outline'}
      size={'icon-sm'}
      className=""
    >
      <ImageIcon className="size-4" />
    </Button>
  );
}

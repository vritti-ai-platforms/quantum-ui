import { Button } from '../../Button';
import type { MenuFooterProps } from '../types';

/**
 * MenuFooter - Clear button footer for SingleSelect dropdown
 *
 * Displays a destructive-styled clear button at the bottom of the dropdown.
 *
 * @internal This component is for internal use within SingleSelect
 */
export const MenuFooter = ({ onClick }: MenuFooterProps) => {
  return (
    <div className="flex flex-row items-center justify-start border-t">
      <Button variant="link" onClick={onClick} className="min-w-0 text-destructive hover:no-underline">
        Clear
      </Button>
    </div>
  );
};

MenuFooter.displayName = 'MenuFooter';

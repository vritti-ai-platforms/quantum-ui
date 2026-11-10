import { TriangleAlert } from 'lucide-react';
import { problemDetail } from '../../../utils/axios';
import { Button } from '../../Button';
import { DataTableEmpty } from './DataTableEmpty';

// The first load failed, so there are no rows: what went wrong, and a retry
export const DataTableLoadFailed = ({
  plural,
  error,
  refetch,
}: {
  plural: string;
  error: unknown;
  refetch?: () => unknown;
}) => (
  <DataTableEmpty
    icon={TriangleAlert}
    title={`Couldn't load ${plural.toLowerCase()}`}
    description={problemDetail(error) ?? 'Something went wrong while loading. Try again.'}
    action={
      refetch && (
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      )
    }
  />
);

// A refetch failed with rows on screen: the rows stay, with this bar along the top saying they are the earlier ones
export const DataTableRefreshFailed = ({ refetch }: { refetch?: () => unknown }) => (
  <div
    role="alert"
    className="flex items-center justify-between gap-2 border-b border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs text-destructive"
  >
    <span className="flex items-center gap-1.5">
      <TriangleAlert className="size-3.5" aria-hidden />
      Couldn't refresh — showing earlier results.
    </span>
    {refetch && (
      <Button variant="link" size="sm" className="h-auto p-0 text-xs text-destructive" onClick={() => refetch()}>
        Retry
      </Button>
    )}
  </div>
);

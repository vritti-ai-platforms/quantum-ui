import { ChartLine } from 'lucide-react';
import { Empty } from '../Empty';
import type { ChartEmptyState } from './types';

// A chart with nothing to draw, for charts without axes to keep
export const ChartEmpty = ({ title, description, icon }: ChartEmptyState) => (
  <Empty icon={icon ?? <ChartLine />} title={title} description={description} className="min-h-0 flex-1" />
);

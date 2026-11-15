import type { Meta, StoryObj } from '@storybook/react';
import { SegmentedProgress } from './SegmentedProgress';
import { SegmentedProgressKey } from './SegmentedProgressKey';

const STAGES = [
  { key: 'allocated', label: 'Allocated' },
  { key: 'ordered', label: 'Ordered' },
  { key: 'inTransit', label: 'In transit' },
  { key: 'received', label: 'Received' },
  { key: 'invoiced', label: 'Invoiced' },
];

function segmentsOf(values: number[]) {
  return STAGES.map((stage, index) => ({ ...stage, value: values[index] ?? 0 }));
}

const meta: Meta<typeof SegmentedProgress> = {
  title: 'Components/SegmentedProgress',
  component: SegmentedProgress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    segments: {
      control: 'object',
      description: 'Stages in pipeline order; each value is a percentage of the whole bar',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedProgress>;

export const Default: Story = {
  args: {
    segments: segmentsOf([12, 18, 10, 22, 20]),
    className: 'w-80',
  },
};

export const WithKey: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <SegmentedProgressKey items={STAGES} />
      <SegmentedProgress segments={segmentsOf([12, 18, 10, 22, 20])} />
    </div>
  ),
};

export const MissingMiddleStage: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <SegmentedProgressKey items={STAGES} />
      <SegmentedProgress segments={segmentsOf([25, 0, 0, 40, 10])} />
    </div>
  ),
};

export const Complete: Story = {
  render: () => <SegmentedProgress segments={segmentsOf([0, 0, 0, 0, 100])} className="w-80" />,
};

export const Empty: Story = {
  render: () => <SegmentedProgress segments={segmentsOf([])} className="w-80" />,
};

export const TableColumn: Story = {
  render: () => {
    const rows = [
      { id: 'PUR-0001', caption: '5 items', values: [] },
      { id: 'PUR-0002', caption: '4 of 5 items allocated', values: [80] },
      { id: 'PUR-0003', caption: '62% received', values: [8, 10, 20, 32, 30] },
      { id: 'PUR-0004', caption: '100% received', values: [0, 0, 0, 0.5, 99.5] },
    ];

    return (
      <div className="w-96 rounded-lg border bg-card">
        <div className="flex flex-col gap-1.5 border-b px-4 py-3">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <SegmentedProgressKey items={STAGES} />
        </div>
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0">
            <span className="w-20 shrink-0 text-sm text-foreground">{row.id}</span>
            <div className="flex flex-1 flex-col gap-1">
              <SegmentedProgress segments={segmentsOf(row.values)} />
              <span className="text-xs text-muted-foreground">{row.caption}</span>
            </div>
          </div>
        ))}
      </div>
    );
  },
};

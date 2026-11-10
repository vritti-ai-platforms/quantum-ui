import type { Meta, StoryObj } from '@storybook/react';
import { useChart } from '../Chart/useChart';
import { RadarChart } from './RadarChart';

const rows = [
  { skill: 'Speed', team: 120, baseline: 100 },
  { skill: 'Reliability', team: 98, baseline: 110 },
  { skill: 'Comfort', team: 86, baseline: 130 },
  { skill: 'Safety', team: 99, baseline: 100 },
  { skill: 'Efficiency', team: 85, baseline: 90 },
  { skill: 'Cost', team: 65, baseline: 85 },
];

const selectSkills = (data: typeof rows) => ({
  rows: data,
  series: [
    { id: 'team', label: 'Team' },
    { id: 'baseline', label: 'Baseline' },
  ],
});

const SkillsChart = () => {
  const chart = useChart({ data: rows, select: selectSkills });
  return <RadarChart chart={chart} mode="compact" angleKey="skill" />;
};

const meta: Meta = { title: 'Charts/RadarChart' };
export default meta;

export const Default: StoryObj = { render: () => <SkillsChart /> };

import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { Breadcrumb, type BreadcrumbSegment } from './Breadcrumb';

const SITE_ID = '3f2b8c1e-6a4d-4e9b-9c7a-1d2e3f4a5b6c';
const SUPPLIER_SITE_ID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';
const PATHNAME = `/site/${SITE_ID}/suppliers/acme-traders/site/${SUPPLIER_SITE_ID}`;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const routes: Record<string, string> = {
  [`/site/${SITE_ID}`]: 'Downtown Store',
  [PATHNAME]: 'Uptown Store',
};

const hideSiteBeforeUuid = (segment: BreadcrumbSegment, index: number, all: BreadcrumbSegment[]) =>
  segment.raw === 'site' && UUID_PATTERN.test(all[index + 1]?.raw ?? '');

const meta: Meta<typeof Breadcrumb> = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={[PATHNAME]}>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  render: () => <Breadcrumb routes={routes} />,
};

export const HideSiteSegments: Story = {
  render: () => <Breadcrumb routes={routes} hideSegment={hideSiteBeforeUuid} />,
};

export const HideSiteSegmentsWithMaxItems: Story = {
  render: () => <Breadcrumb routes={routes} hideSegment={hideSiteBeforeUuid} maxItems={3} />,
};

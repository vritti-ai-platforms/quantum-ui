import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SearchBar } from './SearchBar';

const meta: Meta<typeof SearchBar> = {
  title: 'Components/SearchBar',
  component: SearchBar,
};

export default meta;
type Story = StoryObj<typeof SearchBar>;

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('');

    return (
      <div className="w-[360px]">
        <SearchBar
          value={value}
          onChange={setValue}
          onDebouncedChange={(next) => {
            console.log('debounced', next);
          }}
          placeholder="Search anything..."
        />
      </div>
    );
  },
};

export const Uncontrolled: Story = {
  render: () => (
    <div className="w-[360px]">
      <SearchBar defaultValue="coffee" onDebouncedChange={(next) => console.log('debounced', next)} />
    </div>
  ),
};

export const Loading: Story = {
  args: {
    loading: true,
    value: 'stock levels',
  },
};

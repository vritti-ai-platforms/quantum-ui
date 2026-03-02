import type { Meta } from '@storybook/react';
import { subDays } from 'date-fns';
import { useState } from 'react';
import { DatePicker } from './DatePicker';
import type { DateRange } from './types';

const meta: Meta<typeof DatePicker> = {
  title: 'Components/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
  decorators: [(Story) => <div className="w-72">{Story()}</div>],
};

export default meta;

// --- Single pickers ---

export const DateOnly = () => {
  const [value, setValue] = useState<Date>();
  return <DatePicker label="Date" format="MMM d, yyyy" value={value} onChange={setValue} />;
};

export const YearOnly = () => {
  const [value, setValue] = useState<Date>();
  return <DatePicker label="Year" format="yyyy" value={value} onChange={setValue} />;
};

export const MonthOnly = () => {
  const [value, setValue] = useState<Date>();
  return <DatePicker label="Month" format="MMM yyyy" value={value} onChange={setValue} />;
};

export const Time12Hour = () => {
  const [value, setValue] = useState<Date>();
  return <DatePicker label="Time (12h)" format="hh:mm aa" value={value} onChange={setValue} />;
};

export const Time24Hour = () => {
  const [value, setValue] = useState<Date>();
  return <DatePicker label="Time (24h)" format="HH:mm" value={value} onChange={setValue} />;
};

export const DateTime = () => {
  const [value, setValue] = useState<Date>();
  return <DatePicker label="Date & Time" format="MMM d, yyyy hh:mm aa" value={value} onChange={setValue} />;
};

export const DateTime24h = () => {
  const [value, setValue] = useState<Date>();
  return <DatePicker label="Date & Time (24h)" format="yyyy-MM-dd HH:mm" value={value} onChange={setValue} />;
};

// --- Range pickers ---

export const RangeDate = () => {
  const [value, setValue] = useState<DateRange>();
  return <DatePicker label="Date Range" format="MMM d, yyyy" range value={value} onChange={setValue} />;
};

export const RangeDateWithPresets = () => {
  const [value, setValue] = useState<DateRange>();
  return (
    <DatePicker
      label="Date Range"
      format="MMM d, yyyy"
      range
      value={value}
      onChange={setValue}
      presets={[
        { label: 'Last 7 days', value: { from: subDays(new Date(), 7), to: new Date() } },
        { label: 'Last 30 days', value: { from: subDays(new Date(), 30), to: new Date() } },
        { label: 'Last 90 days', value: { from: subDays(new Date(), 90), to: new Date() } },
      ]}
    />
  );
};

export const RangeTime = () => {
  const [value, setValue] = useState<DateRange>();
  return <DatePicker label="Time Range" format="hh:mm aa" range value={value} onChange={setValue} />;
};

export const RangeDateTime = () => {
  const [value, setValue] = useState<DateRange>();
  return <DatePicker label="DateTime Range" format="MMM d, yyyy hh:mm aa" range value={value} onChange={setValue} />;
};

// --- Options ---

export const Clearable = () => {
  const [value, setValue] = useState<Date>();
  return <DatePicker label="Clearable Date" format="MMM d, yyyy" clearable value={value} onChange={setValue} />;
};

export const WithMinMax = () => {
  const [value, setValue] = useState<Date>();
  return (
    <DatePicker
      label="Constrained Date (2024-2025)"
      format="MMM d, yyyy"
      value={value}
      onChange={setValue}
      minDate={new Date(2024, 0, 1)}
      maxDate={new Date(2025, 11, 31)}
    />
  );
};

export const WithError = () => {
  const [value, setValue] = useState<Date>();
  return (
    <DatePicker label="Date" format="MMM d, yyyy" error="This field is required" value={value} onChange={setValue} />
  );
};

export const Disabled = () => {
  return <DatePicker label="Disabled Date" format="MMM d, yyyy" disabled />;
};

export const DefaultFormat = () => {
  const [value, setValue] = useState<Date>();
  return <DatePicker label="Default (no format prop)" value={value} onChange={setValue} />;
};

// --- All picker types side by side ---

export const AllTypes = () => (
  <div className="flex flex-col gap-6">
    <DatePicker label="Year" format="yyyy" />
    <DatePicker label="Month" format="MMM yyyy" />
    <DatePicker label="Date" format="MMM d, yyyy" />
    <DatePicker label="Time (12h)" format="hh:mm aa" />
    <DatePicker label="Time (24h)" format="HH:mm" />
    <DatePicker label="DateTime (12h)" format="MMM d, yyyy hh:mm aa" />
    <DatePicker label="DateTime (24h)" format="yyyy-MM-dd HH:mm" />
    <DatePicker label="Date Range" format="MMM d, yyyy" range />
    <DatePicker label="With Error" format="MMM d, yyyy" error="Required" />
    <DatePicker label="Disabled" format="MMM d, yyyy" disabled />
  </div>
);

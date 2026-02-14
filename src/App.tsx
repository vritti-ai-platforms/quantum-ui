import { useState } from 'react';
import { Select } from '../lib/components/Select';

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'in', label: 'India' },
];

const regions = [
  { id: 1, name: 'North America' },
  { id: 2, name: 'Europe' },
  { id: 3, name: 'Asia-Pacific' },
];

const groupedCountries = [
  { value: 'us', label: 'United States', groupId: 1 },
  { value: 'ca', label: 'Canada', groupId: 1 },
  { value: 'uk', label: 'United Kingdom', groupId: 2 },
  { value: 'de', label: 'Germany', groupId: 2 },
  { value: 'fr', label: 'France', groupId: 2 },
  { value: 'jp', label: 'Japan', groupId: 3 },
  { value: 'au', label: 'Australia', groupId: 3 },
  { value: 'in', label: 'India', groupId: 3 },
];

const skills = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'nextjs', label: 'Next.js' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'tailwind', label: 'Tailwind CSS' },
  { value: 'nodejs', label: 'Node.js', disabled: true },
];

const skillCategories = [
  { id: 'frontend', name: 'Frontend' },
  { id: 'backend', name: 'Backend' },
  { id: 'languages', name: 'Languages' },
];

const groupedSkills = [
  { value: 'react', label: 'React', groupId: 'frontend' },
  { value: 'vue', label: 'Vue', groupId: 'frontend' },
  { value: 'angular', label: 'Angular', groupId: 'frontend' },
  { value: 'svelte', label: 'Svelte', groupId: 'frontend' },
  { value: 'nodejs', label: 'Node.js', groupId: 'backend' },
  { value: 'nestjs', label: 'NestJS', groupId: 'backend' },
  { value: 'graphql', label: 'GraphQL', groupId: 'backend' },
  { value: 'typescript', label: 'TypeScript', groupId: 'languages' },
  { value: 'rust', label: 'Rust', groupId: 'languages' },
  { value: 'go', label: 'Go', groupId: 'languages' },
];

export const App = () => {
  const [country, setCountry] = useState<string | undefined>(undefined);
  const [searchableCountry, setSearchableCountry] = useState<string | undefined>(undefined);
  const [clearableCountry, setClearableCountry] = useState<string | undefined>(undefined);
  const [groupedCountry, setGroupedCountry] = useState<string | undefined>(undefined);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedGroupedSkills, setSelectedGroupedSkills] = useState<string[]>([]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8 p-8">
      <h1 className="text-2xl font-bold">Select Component Demo</h1>

      {/* Single Select */}
      <Select
        label="Country"
        description="Choose your country of residence"
        placeholder="Select a country"
        options={countries}
        value={country}
        onChange={setCountry}
      />

      {/* Single Select — searchable */}
      <Select
        label="Country (Searchable)"
        description="Type to filter countries"
        placeholder="Search and select a country"
        options={countries}
        value={searchableCountry}
        onChange={setSearchableCountry}
        searchable
      />

      {/* Single Select — clearable + searchable */}
      <Select
        label="Country (Clearable + Searchable)"
        description="Search, select, and clear"
        placeholder="Pick a country"
        options={countries}
        value={clearableCountry}
        onChange={setClearableCountry}
        searchable
        clearable
      />

      {/* Single Select — grouped + searchable + clearable */}
      <Select
        label="Country (Grouped)"
        description="Options organized by region"
        placeholder="Select a country"
        options={groupedCountries}
        groups={regions}
        value={groupedCountry}
        onChange={setGroupedCountry}
        searchable
        clearable
      />

      {/* Single Select with error */}
      <Select
        label="Required Country"
        placeholder="Select a country"
        options={countries}
        error="This field is required"
        required
      />

      {/* Multi Select */}
      <Select
        multiple
        label="Skills"
        description="Select all that apply"
        placeholder="Select skills"
        options={skills}
        value={selectedSkills}
        onChange={setSelectedSkills}
        searchable
      />

      {/* Multi Select — grouped */}
      <Select
        multiple
        label="Skills (Grouped)"
        description="Grouped by category"
        placeholder="Select skills"
        options={groupedSkills}
        groups={skillCategories}
        value={selectedGroupedSkills}
        onChange={setSelectedGroupedSkills}
        searchable
      />

      {/* Multi Select with error */}
      <Select
        multiple
        label="Required Skills"
        placeholder="Pick at least one"
        options={skills}
        error="Please select at least one skill"
        required
      />

      {/* Debug output */}
      <div className="rounded-md border border-border bg-muted/50 p-4 text-sm">
        <p>
          <strong>Country:</strong> {country || '(none)'}
        </p>
        <p>
          <strong>Searchable Country:</strong> {searchableCountry || '(none)'}
        </p>
        <p>
          <strong>Clearable Country:</strong> {clearableCountry || '(none)'}
        </p>
        <p>
          <strong>Grouped Country:</strong> {groupedCountry || '(none)'}
        </p>
        <p>
          <strong>Skills:</strong> {selectedSkills.length > 0 ? selectedSkills.join(', ') : '(none)'}
        </p>
        <p>
          <strong>Grouped Skills:</strong>{' '}
          {selectedGroupedSkills.length > 0 ? selectedGroupedSkills.join(', ') : '(none)'}
        </p>
      </div>
    </div>
  );
};

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

export const App = () => {
  const [country, setCountry] = useState<string | undefined>(undefined);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

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
          <strong>Skills:</strong> {selectedSkills.length > 0 ? selectedSkills.join(', ') : '(none)'}
        </p>
      </div>
    </div>
  );
};

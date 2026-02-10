import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Check, Globe, Mail, User, Users } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  SingleSelect,
  ThemeToggle,
  Typography,
} from '../lib/components';
import { createMockAxios } from './mockApi';
import { departmentOptions, mockCountries, roleOptions } from './mockData';

// Mock data for testing
const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Pending', value: 'pending' },
  { label: 'Archived', value: 'archived' },
];

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
];

const teamOptions = [
  { label: 'Engineering', value: 'eng', icon: <Users className="h-4 w-4" /> },
  { label: 'Design', value: 'design', icon: <Check className="h-4 w-4" /> },
  { label: 'Marketing', value: 'marketing', icon: <Globe className="h-4 w-4" /> },
  { label: 'Sales', value: 'sales', icon: <Mail className="h-4 w-4" /> },
];

const userOptions = [
  {
    label: 'John Doe',
    value: 'john',
    subLabel: 'john@example.com',
    icon: <User className="h-4 w-4" />,
  },
  {
    label: 'Jane Smith',
    value: 'jane',
    subLabel: 'jane@example.com',
    icon: <User className="h-4 w-4" />,
  },
  {
    label: 'Bob Johnson',
    value: 'bob',
    subLabel: 'bob@example.com',
    icon: <User className="h-4 w-4" />,
  },
  {
    label: 'Alice Williams',
    value: 'alice',
    subLabel: 'alice@example.com',
    icon: <User className="h-4 w-4" />,
  },
];

const countryOptions = [
  { label: 'United States', value: 'us', subLabel: 'North America' },
  { label: 'United Kingdom', value: 'uk', subLabel: 'Europe' },
  { label: 'Canada', value: 'ca', subLabel: 'North America' },
  { label: 'Australia', value: 'au', subLabel: 'Oceania' },
  { label: 'Germany', value: 'de', subLabel: 'Europe' },
  { label: 'France', value: 'fr', subLabel: 'Europe' },
  { label: 'Japan', value: 'jp', subLabel: 'Asia' },
  { label: 'India', value: 'in', subLabel: 'Asia' },
];

function App() {
  // State for controlled components
  const [status, setStatus] = useState<string | null>(null);
  const [priority, setPriority] = useState<string>('medium');
  const [team, setTeam] = useState<string | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [requiredField, setRequiredField] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  // Error state example
  const [hasError, setHasError] = useState(false);

  // Form integration state
  const registrationSchema = z.object({
    formCountry: z.string().min(1, 'Country is required'),
    formRole: z.string().min(1, 'Role selection is required'),
    formDepartment: z.string().min(1, 'Department is required'),
  });

  type RegistrationFormData = z.infer<typeof registrationSchema>;

  const registrationForm = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      formCountry: '',
      formRole: '',
      formDepartment: '',
    },
  });

  // Registration mutation with simulated API call
  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate random API errors (20% chance)
      if (Math.random() < 0.2) {
        throw new Error('Registration failed. Please try again.');
      }

      // Return success response
      return {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date().toISOString(),
      };
    },
    onSuccess: (data) => {
      console.log('Registration successful:', data);
      alert(
        `Registration Successful!\n\nCountry: ${countryOptions.find((c) => c.value === data.formCountry)?.label}\nRole: ${roleOptions.find((r) => r.value === data.formRole)?.label}\nDepartment: ${departmentOptions.find((d) => d.value === data.formDepartment)?.label}\n\nID: ${data.id}`,
      );
      // Reset form after successful submission
      registrationForm.reset();
    },
    onError: (error) => {
      console.error('Registration failed:', error);
      // Form will automatically show the error via root error
    },
  });

  // API integration state
  const [apiUser, setApiUser] = useState<string | null>(null);
  const [apiDepartment, setApiDepartment] = useState<string | null>(null);
  const [apiCountry, setApiCountry] = useState<string | null>(null);

  // Create mock axios instance
  const mockAxios = createMockAxios();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-16 items-center gap-4 border-b px-6">
        <Typography variant="h5" className="font-semibold">
          Quantum UI - SingleSelect Testing
        </Typography>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      <main className="p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <div className="text-center">
            <Typography variant="h2" className="mb-2">
              SingleSelect Component Tests
            </Typography>
            <Typography variant="body1" intent="secondary">
              Comprehensive testing of all SingleSelect features and configurations
            </Typography>
          </div>

          {/* Basic Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Examples</CardTitle>
              <CardDescription>Simple single-select dropdowns with static options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <SingleSelect
                    label="Status"
                    value={status}
                    onChange={(value) => setStatus(value as string | null)}
                    options={statusOptions}
                    placeholder="Select a status..."
                  />
                  <Typography variant="caption" className="mt-1 text-muted-foreground">
                    Selected: {status || 'None'}
                  </Typography>
                </div>

                <div>
                  <SingleSelect
                    label="Priority"
                    value={priority}
                    onChange={(value) => setPriority(value as string)}
                    options={priorityOptions}
                    placeholder="Select priority..."
                  />
                  <Typography variant="caption" className="mt-1 text-muted-foreground">
                    Selected: {priority}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* With Icons */}
          <Card>
            <CardHeader>
              <CardTitle>With Icons</CardTitle>
              <CardDescription>Options with leading icons for visual clarity</CardDescription>
            </CardHeader>
            <CardContent>
              <SingleSelect
                label="Team"
                value={team}
                onChange={(value) => setTeam(value as string | null)}
                options={teamOptions}
                placeholder="Select a team..."
                fullWidth
              />
              <Typography variant="caption" className="mt-2 text-muted-foreground">
                Selected team: {team || 'None'}
              </Typography>
            </CardContent>
          </Card>

          {/* With Sub-labels */}
          <Card>
            <CardHeader>
              <CardTitle>With Sub-labels</CardTitle>
              <CardDescription>Two-line options with primary and secondary text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <SingleSelect
                    label="User"
                    value={user}
                    onChange={(value) => setUser(value as string | null)}
                    options={userOptions}
                    placeholder="Select a user..."
                  />
                  <Typography variant="caption" className="mt-1 text-muted-foreground">
                    Selected: {user || 'None'}
                  </Typography>
                </div>

                <div>
                  <SingleSelect
                    label="Country"
                    value={country}
                    onChange={(value) => setCountry(value as string | null)}
                    options={countryOptions}
                    placeholder="Select a country..."
                  />
                  <Typography variant="caption" className="mt-1 text-muted-foreground">
                    Selected: {country || 'None'}
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* States - Required, Error, Disabled */}
          <Card>
            <CardHeader>
              <CardTitle>Field States</CardTitle>
              <CardDescription>Required fields, error states, and disabled variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Required Field */}
                <div>
                  <SingleSelect
                    label="Required Field"
                    value={requiredField}
                    onChange={(val) => {
                      setRequiredField(val as string | null);
                      setHasError(false);
                    }}
                    options={statusOptions}
                    placeholder="This field is required..."
                    required
                    error={hasError ? 'This field is required' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!requiredField) setHasError(true);
                    }}
                    className="mt-2 rounded bg-primary px-3 py-1 text-sm text-primary-foreground hover:bg-primary/90"
                  >
                    Validate
                  </button>
                </div>

                {/* Disabled Field */}
                <div>
                  <SingleSelect
                    label="Disabled Field"
                    value="inactive"
                    onChange={() => {}}
                    options={statusOptions}
                    disabled
                  />
                  <Typography variant="caption" className="mt-1 text-muted-foreground">
                    This field is disabled
                  </Typography>
                </div>

                {/* With Helper Text */}
                <div>
                  <SingleSelect
                    label="With Helper Text"
                    value={status}
                    onChange={(value) => setStatus(value as string | null)}
                    options={statusOptions}
                    placeholder="Select status..."
                    helperText="Choose the current status of the item"
                  />
                </div>

                {/* Loading State */}
                <div>
                  <SingleSelect
                    label="Loading State"
                    value={null}
                    onChange={() => {}}
                    options={[]}
                    loading
                    placeholder="Loading..."
                  />
                  <Typography variant="caption" className="mt-1 text-muted-foreground">
                    Simulated loading state
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter Mode */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Mode</CardTitle>
              <CardDescription>Compact chip/badge style for filters and toolbar actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <SingleSelect
                  type="filter"
                  label="Status"
                  value={filterStatus}
                  onChange={(value) => setFilterStatus(value as string | null)}
                  options={statusOptions}
                />
                <SingleSelect
                  type="filter"
                  label="Priority"
                  value={filterPriority}
                  onChange={(value) => setFilterPriority(value as string | null)}
                  options={priorityOptions}
                />
                <SingleSelect
                  type="filter"
                  label="Team"
                  value={team}
                  onChange={(value) => setTeam(value as string | null)}
                  options={teamOptions}
                />
              </div>
              <Typography variant="caption" className="mt-3 text-muted-foreground">
                Filter mode shows: Status = {filterStatus || 'All'}, Priority = {filterPriority || 'All'}, Team ={' '}
                {team || 'All'}
              </Typography>
            </CardContent>
          </Card>

          {/* Full Width Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Full Width</CardTitle>
              <CardDescription>Components that span the full width of their container</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SingleSelect
                label="Full Width Select"
                value={status}
                onChange={(value) => setStatus(value as string | null)}
                options={statusOptions}
                placeholder="This select takes full width..."
                fullWidth
              />

              <SingleSelect
                label="Full Width with Sub-labels"
                value={user}
                onChange={(value) => setUser(value as string | null)}
                options={userOptions}
                placeholder="Select a user..."
                fullWidth
              />
            </CardContent>
          </Card>

          {/* Clear Button Control */}
          <Card>
            <CardHeader>
              <CardTitle>Clear Button</CardTitle>
              <CardDescription>Control whether the clear button is shown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <SingleSelect
                    label="With Clear Button (default)"
                    value={status}
                    onChange={(value) => setStatus(value as string | null)}
                    options={statusOptions}
                    placeholder="Can be cleared..."
                  />
                  <Typography variant="caption" className="mt-1 text-muted-foreground">
                    Shows clear button when value is selected
                  </Typography>
                </div>

                <div>
                  <SingleSelect
                    label="Without Clear Button"
                    value={priority}
                    onChange={(value) => setPriority(value as string)}
                    options={priorityOptions}
                    placeholder="Cannot be cleared..."
                    disableClear
                  />
                  <Typography variant="caption" className="mt-1 text-muted-foreground">
                    Clear button is hidden (disableClear prop)
                  </Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Demonstration */}
          <Card>
            <CardHeader>
              <CardTitle>Search Functionality</CardTitle>
              <CardDescription>
                Type to search through options - works with both static and API-driven data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SingleSelect
                label="Search Countries"
                value={country}
                onChange={(value) => setCountry(value as string | null)}
                options={countryOptions}
                placeholder="Type to search..."
                fullWidth
              />
              <Typography variant="caption" className="mt-2 text-muted-foreground">
                Try typing "united" or "asia" to filter the list
              </Typography>
            </CardContent>
          </Card>

          {/* Form Integration */}
          <Card>
            <CardHeader>
              <CardTitle>Form Integration</CardTitle>
              <CardDescription>SingleSelect with react-hook-form validation and error handling</CardDescription>
            </CardHeader>
            <CardContent>
              <Form mutation={registrationMutation} form={registrationForm}>
                <div className="space-y-4">
                  <SingleSelect
                    name="formCountry"
                    label="Country"
                    options={countryOptions}
                    placeholder="Select your country..."
                    required
                    helperText="This field is required"
                  />

                  <SingleSelect
                    name="formRole"
                    label="Role"
                    options={roleOptions}
                    placeholder="Select your role..."
                    required
                  />

                  {/* Conditional field - only shows when role is selected */}
                  {registrationForm.watch('formRole') && (
                    <SingleSelect
                      name="formDepartment"
                      label="Department"
                      options={departmentOptions}
                      placeholder="Select your department..."
                      required
                    />
                  )}

                  <Button type="submit">Submit Registration</Button>
                </div>
              </Form>
              <Typography variant="caption" className="mt-4 text-muted-foreground">
                Try: Submit without selecting (shows validation errors), then fill form and submit. Button shows
                loading state during submission. Form has 20% chance of API error for testing error handling.
              </Typography>
            </CardContent>
          </Card>

          {/* API Integration - Basic */}
          <Card>
            <CardHeader>
              <CardTitle>API Integration - Basic Load</CardTitle>
              <CardDescription>Load options from mock API endpoint with pagination (50+ users)</CardDescription>
            </CardHeader>
            <CardContent>
              <SingleSelect
                label="Select User (API)"
                value={apiUser}
                onChange={(val) => setApiUser(val as string | null)}
                optionsApiEndPoint="/api/users"
                externalAxios={mockAxios}
                dbValueProps={{ valueKey: 'id' }}
                dbLabelProps={{
                  labelKey: 'name',
                  subLabelKey: 'email',
                }}
                placeholder="Search users..."
                fullWidth
              />
              <Typography variant="caption" className="mt-2 text-muted-foreground">
                Selected user ID: {apiUser || 'None'}
              </Typography>
              <Typography variant="caption" className="mt-1 text-muted-foreground">
                Try: Opening dropdown (loads 10 items), searching names/emails, scrolling to bottom (pagination)
              </Typography>
            </CardContent>
          </Card>

          {/* API Integration - Server-side Search */}
          <Card>
            <CardHeader>
              <CardTitle>API Integration - Server-side Search</CardTitle>
              <CardDescription>Type to trigger debounced API search (300ms delay)</CardDescription>
            </CardHeader>
            <CardContent>
              <SingleSelect
                label="Search Departments"
                value={apiDepartment}
                onChange={(val) => setApiDepartment(val as string | null)}
                optionsApiEndPoint="/api/departments"
                externalAxios={mockAxios}
                dbValueProps={{ valueKey: 'id' }}
                dbLabelProps={{
                  labelKey: 'name',
                  subLabelKey: 'description',
                }}
                placeholder="Type to search departments..."
                fullWidth
              />
              <Typography variant="caption" className="mt-2 text-muted-foreground">
                Selected: {mockCountries.find((c) => c.id === apiDepartment)?.name || 'None'}
              </Typography>
              <Typography variant="caption" className="mt-1 text-muted-foreground">
                Watch network tab: 300ms debounce, search parameter sent to API
              </Typography>
            </CardContent>
          </Card>

          {/* API Integration - Pagination */}
          <Card>
            <CardHeader>
              <CardTitle>API Integration - Infinite Scroll</CardTitle>
              <CardDescription>Scroll to bottom to load more (100+ countries total)</CardDescription>
            </CardHeader>
            <CardContent>
              <SingleSelect
                label="Select Country (Paginated)"
                value={apiCountry}
                onChange={(val) => setApiCountry(val as string | null)}
                optionsApiEndPoint="/api/countries"
                externalAxios={mockAxios}
                dbValueProps={{ valueKey: 'id' }}
                dbLabelProps={{
                  labelKey: 'name',
                  subLabelKey: 'continent',
                }}
                placeholder="Search countries..."
                fullWidth
              />
              <Typography variant="caption" className="mt-2 text-muted-foreground">
                Selected: {mockCountries.find((c) => c.id === apiCountry)?.name || 'None'}
              </Typography>
              <Typography variant="caption" className="mt-1 text-muted-foreground">
                Loads 10 items at a time. Scroll to bottom for more. Search filters server-side.
              </Typography>
            </CardContent>
          </Card>

          {/* API Integration - Custom Axios */}
          <Card>
            <CardHeader>
              <CardTitle>API Integration - Custom Axios Instance</CardTitle>
              <CardDescription>Using custom axios with interceptors for mock API</CardDescription>
            </CardHeader>
            <CardContent>
              <SingleSelect
                label="Users (Custom Axios)"
                value={apiUser}
                onChange={(val) => setApiUser(val as string | null)}
                optionsApiEndPoint="/users"
                externalAxios={mockAxios}
                dbValueProps={{ valueKey: 'id' }}
                dbLabelProps={{ labelKey: 'name', subLabelKey: 'email' }}
                fullWidth
              />
              <Typography variant="caption" className="mt-2 text-muted-foreground">
                Check browser console for [MockAPI] logs showing intercepted requests
              </Typography>
            </CardContent>
          </Card>

          {/* API Integration - With Additional Params */}
          <Card>
            <CardHeader>
              <CardTitle>API Integration - Query Parameters</CardTitle>
              <CardDescription>API request includes additional query parameters for filtering</CardDescription>
            </CardHeader>
            <CardContent>
              <SingleSelect
                label="Admin Users Only"
                value={apiUser}
                onChange={(val) => setApiUser(val as string | null)}
                optionsApiEndPoint="/api/users"
                externalAxios={mockAxios}
                optionsApiEndpointParams={{
                  role: 'admin',
                  status: 'active',
                }}
                dbValueProps={{ valueKey: 'id' }}
                dbLabelProps={{ labelKey: 'name', subLabelKey: 'email' }}
                fullWidth
              />
              <Typography variant="caption" className="mt-2 text-muted-foreground">
                Filters: role=admin, status=active (check console logs)
              </Typography>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Current Selections Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 rounded-md bg-muted p-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className="text-muted-foreground">{status || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Priority:</span>
                    <span className="text-muted-foreground">{priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Team:</span>
                    <span className="text-muted-foreground">{team || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">User:</span>
                    <span className="text-muted-foreground">{user || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Country:</span>
                    <span className="text-muted-foreground">{country || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Required Field:</span>
                    <span className="text-muted-foreground">{requiredField || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Form Country:</span>
                    <span className="text-muted-foreground">
                      {registrationForm.watch('formCountry') || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Form Role:</span>
                    <span className="text-muted-foreground">
                      {registrationForm.watch('formRole') || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Form Department:</span>
                    <span className="text-muted-foreground">
                      {registrationForm.watch('formDepartment') || 'Not selected'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">API User:</span>
                    <span className="text-muted-foreground">{apiUser || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">API Department:</span>
                    <span className="text-muted-foreground">{apiDepartment || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">API Country:</span>
                    <span className="text-muted-foreground">{apiCountry || 'Not selected'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default App;

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../Button/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic card
export const Basic: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent className="p-6">
        <p>This is a basic card with just content.</p>
      </CardContent>
    </Card>
  ),
};

// Card with header
export const WithHeader: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>This is a card description that explains what this card is about.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content of the card where you can put any information you want to display.</p>
      </CardContent>
    </Card>
  ),
};

// Card with footer
export const WithFooter: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Project Setup</CardTitle>
        <CardDescription>Configure your new project settings</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Choose your preferred settings and click continue to proceed with the setup.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button variant="default">Continue</Button>
      </CardFooter>
    </Card>
  ),
};

// Complete card with all parts
export const Complete: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>Add a new payment method to your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="card-number" className="text-sm font-medium">
              Card Number
            </label>
            <input
              id="card-number"
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="card-expiry" className="text-sm font-medium">
                Expiry
              </label>
              <input
                id="card-expiry"
                type="text"
                placeholder="MM/YY"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="card-cvc" className="text-sm font-medium">
                CVC
              </label>
              <input
                id="card-cvc"
                type="text"
                placeholder="123"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="default" className="w-full">
          Add Payment Method
        </Button>
      </CardFooter>
    </Card>
  ),
};

// Profile card example
export const ProfileCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center text-primary-foreground font-semibold text-lg">
          JD
        </div>
        <CardTitle>John Doe</CardTitle>
        <CardDescription>Software Engineer at Acme Corp</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
            <span>john.doe@example.com</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>San Francisco, CA</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View Profile
        </Button>
      </CardFooter>
    </Card>
  ),
};

// Stats card
export const StatsCard: Story = {
  render: () => (
    <Card className="w-72">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">$45,231.89</div>
        <p className="text-xs text-muted-foreground">
          <span className="text-green-600">+20.1%</span> from last month
        </p>
      </CardContent>
    </Card>
  ),
};

// Feature card
export const FeatureCard: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <CardTitle>Lightning Fast</CardTitle>
        <CardDescription>Built for performance with modern web technologies</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Experience blazing fast load times and smooth interactions with our optimized architecture.
        </p>
      </CardContent>
    </Card>
  ),
};

// Multiple cards showcase
export const MultipleCards: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Free</CardTitle>
          <CardDescription>Perfect for getting started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">$0</div>
          <div className="text-sm text-muted-foreground">per month</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Up to 3 projects
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Community support
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Get Started
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-primary">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Pro</CardTitle>
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">Popular</span>
          </div>
          <CardDescription>Best for growing businesses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">$29</div>
          <div className="text-sm text-muted-foreground">per month</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Unlimited projects
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Priority support
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Advanced analytics
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="default" className="w-full">
            Choose Pro
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enterprise</CardTitle>
          <CardDescription>For large scale applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">$99</div>
          <div className="text-sm text-muted-foreground">per month</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Everything in Pro
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Dedicated support
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Custom integrations
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Contact Sales
          </Button>
        </CardFooter>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

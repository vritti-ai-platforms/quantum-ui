import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../Button';
import { Checkbox } from '../Checkbox';
import { FieldGroup, FieldLegend, FieldSet } from '../Field';
import { PasswordField } from '../PasswordField';
import { TextArea } from '../TextArea';
import { TextField } from '../TextField';
import { Form } from './Form';

const meta: Meta<typeof Form> = {
  title: 'Components/Form',
  component: Form,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Login Form Example
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginForm: Story = {
  render: () => {
    const form = useForm<LoginFormValues>({
      resolver: zodResolver(loginSchema),
      defaultValues: {
        email: '',
        password: '',
      },
    });

    const onSubmit = (data: LoginFormValues) => {
      console.log('Login data:', data);
      alert(`Login successful!\nEmail: ${data.email}`);
    };

    return (
      <div className="w-96">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Sign In</h2>
          <p className="text-sm text-muted-foreground mt-1">Enter your credentials to continue</p>
        </div>
        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <TextField name="email" label="Email Address" placeholder="you@example.com" type="email" />
          <PasswordField name="password" label="Password" placeholder="Enter your password" />
          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </Form>
      </div>
    );
  },
};

// Registration Form Example
const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegistrationForm: Story = {
  render: () => {
    const form = useForm<RegisterFormValues>({
      resolver: zodResolver(registerSchema),
      defaultValues: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        terms: false,
      },
    });

    const onSubmit = (data: RegisterFormValues) => {
      console.log('Registration data:', data);
      alert(`Registration successful!\nName: ${data.firstName} ${data.lastName}\nEmail: ${data.email}`);
    };

    return (
      <div className="w-96">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Create Account</h2>
          <p className="text-sm text-muted-foreground mt-1">Sign up to get started</p>
        </div>
        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <FieldGroup>
            <TextField name="firstName" label="First Name" placeholder="John" />
            <TextField name="lastName" label="Last Name" placeholder="Doe" />
          </FieldGroup>
          <TextField name="email" label="Email Address" placeholder="you@example.com" type="email" />
          <PasswordField name="password" label="Password" placeholder="Create a password" showStrengthIndicator />
          <PasswordField name="confirmPassword" label="Confirm Password" placeholder="Confirm your password" />
          <Checkbox name="terms" label="I accept the terms and conditions" />
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </Form>
      </div>
    );
  },
};

// Contact Form Example
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export const ContactForm: Story = {
  render: () => {
    const form = useForm<ContactFormValues>({
      resolver: zodResolver(contactSchema),
      defaultValues: {
        name: '',
        email: '',
        subject: '',
        message: '',
      },
    });

    const onSubmit = (data: ContactFormValues) => {
      console.log('Contact data:', data);
      alert(`Message sent!\nFrom: ${data.name}\nSubject: ${data.subject}`);
    };

    return (
      <div className="w-[500px]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Contact Us</h2>
          <p className="text-sm text-muted-foreground mt-1">Send us a message and we'll get back to you</p>
        </div>
        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <TextField name="name" label="Name" placeholder="Your name" />
          <TextField name="email" label="Email" placeholder="your.email@example.com" type="email" />
          <TextField name="subject" label="Subject" placeholder="What is this about?" />
          <TextArea
            name="message"
            label="Message"
            placeholder="Tell us more..."
            rows={6}
            description="Please provide as much detail as possible"
          />
          <FieldGroup>
            <Button type="submit">Send Message</Button>
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Clear
            </Button>
          </FieldGroup>
        </Form>
      </div>
    );
  },
};

// Profile Settings Form
const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  bio: z.string().max(200, 'Bio must not exceed 200 characters').optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  notifications: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const ProfileSettingsForm: Story = {
  render: () => {
    const form = useForm<ProfileFormValues>({
      resolver: zodResolver(profileSchema),
      defaultValues: {
        displayName: 'John Doe',
        bio: 'Software developer passionate about building great user experiences.',
        website: 'https://example.com',
        notifications: true,
      },
    });

    const onSubmit = (data: ProfileFormValues) => {
      console.log('Profile data:', data);
      alert('Profile updated successfully!');
    };

    return (
      <div className="w-[500px]">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Profile Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">Update your profile information</p>
        </div>
        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <TextField
            name="displayName"
            label="Display Name"
            placeholder="Your display name"
            description="This is how others will see your name"
          />
          <TextArea
            name="bio"
            label="Bio"
            placeholder="Tell us about yourself"
            rows={4}
            description="Maximum 200 characters"
          />
          <TextField
            name="website"
            label="Website"
            placeholder="https://example.com"
            type="url"
            description="Your personal or professional website"
          />
          <Checkbox name="notifications" label="Receive email notifications" />
          <FieldGroup>
            <Button type="submit">Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Cancel
            </Button>
          </FieldGroup>
        </Form>
      </div>
    );
  },
};

// Simple Form without validation
export const SimpleForm: Story = {
  render: () => {
    const form = useForm({
      defaultValues: {
        username: '',
        email: '',
      },
    });

    const onSubmit = (data: any) => {
      console.log('Form data:', data);
      alert(`Data submitted:\n${JSON.stringify(data, null, 2)}`);
    };

    return (
      <div className="w-96">
        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <TextField name="username" label="Username" placeholder="Choose a username" />
          <TextField name="email" label="Email" placeholder="your.email@example.com" type="email" />
          <Button type="submit">Submit</Button>
        </Form>
      </div>
    );
  },
};

// Form with dynamic validation
const dynamicSchema = z
  .object({
    accountType: z.enum(['personal', 'business']),
    name: z.string().min(2, 'Name is required'),
    companyName: z.string().optional(),
    taxId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.accountType === 'business') {
        return !!data.companyName && !!data.taxId;
      }
      return true;
    },
    {
      message: 'Company name and Tax ID are required for business accounts',
      path: ['companyName'],
    },
  );

type DynamicFormValues = z.infer<typeof dynamicSchema>;

export const DynamicValidationForm: Story = {
  render: () => {
    const form = useForm<DynamicFormValues>({
      resolver: zodResolver(dynamicSchema),
      defaultValues: {
        accountType: 'personal',
        name: '',
        companyName: '',
        taxId: '',
      },
    });

    const accountType = form.watch('accountType');

    const onSubmit = (data: DynamicFormValues) => {
      console.log('Form data:', data);
      alert(`Account created!\nType: ${data.accountType}\nName: ${data.name}`);
    };

    return (
      <div className="w-96">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Create Account</h2>
          <p className="text-sm text-muted-foreground mt-1">Choose your account type</p>
        </div>
        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <FieldSet>
            <FieldLegend variant="label">Account Type</FieldLegend>
            <FieldGroup>
              <label className="flex items-center gap-2">
                <input type="radio" value="personal" {...form.register('accountType')} className="h-4 w-4" />
                <span className="text-sm">Personal</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" value="business" {...form.register('accountType')} className="h-4 w-4" />
                <span className="text-sm">Business</span>
              </label>
            </FieldGroup>
          </FieldSet>

          <TextField
            name="name"
            label={accountType === 'business' ? 'Contact Name' : 'Full Name'}
            placeholder="Enter your name"
          />

          {accountType === 'business' && (
            <>
              <TextField name="companyName" label="Company Name" placeholder="Enter company name" />
              <TextField name="taxId" label="Tax ID" placeholder="Enter tax ID" />
            </>
          )}

          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </Form>
      </div>
    );
  },
};

// Form with all field types
const comprehensiveSchema = z.object({
  text: z.string().min(1, 'This field is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Minimum 8 characters'),
  textarea: z.string().min(10, 'Minimum 10 characters'),
  checkbox: z.boolean().refine((val) => val === true, 'Must be checked'),
});

type ComprehensiveFormValues = z.infer<typeof comprehensiveSchema>;

export const AllFieldTypes: Story = {
  render: () => {
    const form = useForm<ComprehensiveFormValues>({
      resolver: zodResolver(comprehensiveSchema),
      defaultValues: {
        text: '',
        email: '',
        password: '',
        textarea: '',
        checkbox: false,
      },
    });

    const onSubmit = (data: ComprehensiveFormValues) => {
      console.log('Form data:', data);
      alert('All fields validated successfully!');
    };

    return (
      <div className="w-96">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">All Field Types</h2>
          <p className="text-sm text-muted-foreground mt-1">Example with all supported field types</p>
        </div>
        <Form form={form} onSubmit={onSubmit} className="space-y-4">
          <TextField
            name="text"
            label="Text Field"
            placeholder="Enter text"
            description="This is a regular text field"
          />
          <TextField
            name="email"
            label="Email Field"
            placeholder="you@example.com"
            type="email"
            description="This validates email format"
          />
          <PasswordField name="password" label="Password Field" placeholder="Enter password" showStrengthIndicator />
          <TextArea
            name="textarea"
            label="Text Area"
            placeholder="Enter longer text"
            rows={4}
            description="For longer content"
          />
          <Checkbox name="checkbox" label="I agree to the terms and conditions" />
          <Button type="submit" className="w-full">
            Submit Form
          </Button>
        </Form>
      </div>
    );
  },
};

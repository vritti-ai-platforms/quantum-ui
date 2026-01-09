import { Bell, FileText, Folder, Home, Mail, Search, Settings, User } from 'lucide-react';
import type React from 'react';
import { useCallback, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DatePicker,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  TextField,
  ThemeToggle,
  Typography,
} from '../lib/components';

function App() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Memoized callbacks
  const handleSendMessage = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      alert(`Email: ${email}\nMessage: ${message}`);
      setLoading(false);
    }, 1000);
  }, [email, message]);

  const handleClear = useCallback(() => {
    setEmail('');
    setMessage('');
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);

  const handleIncrement = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  const handleDecrement = useCallback(() => {
    setCount((prev) => prev - 1);
  }, []);

  const handleReset = useCallback(() => {
    setCount(0);
  }, []);
  //commit

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">Q</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Quantum UI</span>
              <span className="text-xs text-muted-foreground">v1.0.0</span>
            </div>
          </div>
          <SidebarInput placeholder="Search..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive>
                    <Home />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Search />
                    <span>Search</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Components</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <FileText />
                    <span>Components</span>
                    <SidebarMenuBadge>12</SidebarMenuBadge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Folder />
                    <span>Forms</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Notifications</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Mail />
                    <span>Inbox</span>
                    <SidebarMenuBadge>5</SidebarMenuBadge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Bell />
                    <span>Notifications</span>
                    <SidebarMenuBadge>3</SidebarMenuBadge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <User />
                <span>Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="min-h-screen bg-background">
          <header className="flex h-16 items-center gap-4 border-b px-6">
            <SidebarTrigger />
            <Typography variant="h5" className="font-semibold">
              Quantum UI
            </Typography>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </header>
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div className="text-center">
                <Typography variant="h1" className="mb-4">
                  Quantum UI
                </Typography>
                <Typography variant="body1" intent="secondary" className="mb-4">
                  Modern component library built with shadcn/ui and Tailwind CSS
                </Typography>
              </div>

              {/* Component Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Buttons Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Button Components</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Button variant="default">Primary</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="destructive">Destructive</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="outline">Outline</Button>
                        <Button disabled>Disabled</Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm">Small</Button>
                        <Button size="default">Default</Button>
                        <Button size="lg">Large</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Form Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Form Components</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <TextField
                        label="Email Address"
                        placeholder="Enter your email"
                        type="email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                      />
                      <TextField
                        label="Message"
                        placeholder="Enter your message"
                        value={message}
                        onChange={handleMessageChange}
                      />
                      <DatePicker
                        label="Date of Birth"
                        placeholder="Select your date of birth"
                        value={selectedDate}
                        onValueChange={setSelectedDate}
                        description="Please select your date of birth"
                      />
                      <div className="flex gap-2">
                        <Button variant="default" onClick={handleSendMessage} disabled={loading}>
                          {loading ? 'Sending...' : 'Send Message'}
                        </Button>
                        <Button variant="secondary" onClick={handleClear} disabled={loading}>
                          Clear
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Typography Showcase */}
              <Card>
                <CardHeader>
                  <CardTitle>Typography Hierarchy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Typography variant="h4">H4: Section Header</Typography>
                    <Typography variant="h5">H5: Subsection Header</Typography>
                    <Typography variant="h6">H6: Component Header</Typography>
                    <Typography variant="body1">
                      Body 1: Primary text content with excellent readability and proper line spacing.
                    </Typography>
                    <Typography variant="body2" intent="secondary">
                      Body 2: Secondary text content for supporting information.
                    </Typography>
                    <Typography variant="caption" intent="secondary">
                      Caption: Small text for metadata and annotations
                    </Typography>
                  </div>
                </CardContent>
              </Card>

              {/* State Examples */}
              <Card>
                <CardHeader>
                  <CardTitle>Component States</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Typography variant="h6" className="mb-4">
                        Text Field States
                      </Typography>
                      <div className="space-y-3">
                        <TextField label="Normal State" placeholder="Normal input" />
                        <TextField
                          label="Success State"
                          placeholder="Success input"
                          description="Input validated successfully"
                          defaultValue="valid@example.com"
                          className="border-green-500 focus-visible:ring-green-200"
                        />
                        <TextField
                          label="Error State"
                          placeholder="Error input"
                          error="Please enter a valid email"
                          defaultValue="invalid"
                          className="border-red-500 focus-visible:ring-red-200"
                        />
                      </div>
                    </div>
                    <div>
                      <Typography variant="h6" className="mb-4">
                        Text Intent Colors
                      </Typography>
                      <div className="space-y-2">
                        <Typography intent="primary">Primary text</Typography>
                        <Typography intent="secondary">Secondary text</Typography>
                        <Typography intent="success">Success text</Typography>
                        <Typography intent="warning">Warning text</Typography>
                        <Typography intent="primary">Brand text</Typography>
                        <Typography intent="muted">Disabled text</Typography>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Counter */}
              <Card>
                <CardHeader>
                  <CardTitle>Interactive Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center space-x-4">
                    <Button variant="outline" onClick={handleDecrement} size="sm">
                      -
                    </Button>
                    <div className="text-center min-w-[100px]">
                      <Typography variant="h4" className="font-mono">
                        {count}
                      </Typography>
                      <Typography variant="caption" intent="secondary">
                        Counter Value
                      </Typography>
                    </div>
                    <Button variant="outline" onClick={handleIncrement} size="sm">
                      +
                    </Button>
                  </div>
                  <div className="flex justify-center mt-4">
                    <Button variant="secondary" onClick={handleReset} size="sm">
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* DatePicker Showcase */}
              <Card>
                <CardHeader>
                  <CardTitle>DatePicker Component</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <DatePicker
                      label="Date of Birth"
                      placeholder="Select date"
                      value={selectedDate}
                      onValueChange={setSelectedDate}
                    />
                    <DatePicker label="Appointment Date" placeholder="Select date" />
                    <DatePicker label="Event Date" placeholder="Select date" error="This field is required" />
                    {selectedDate && (
                      <div className="md:col-span-2 p-4 bg-muted rounded-md">
                        <Typography variant="body2" className="font-semibold mb-2">
                          Selected Date:
                        </Typography>
                        <Typography variant="body1">
                          {selectedDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Typography>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Card Variants */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <Typography variant="h6">Standard Card</Typography>
                    <Typography variant="body2">Default shadcn card styling</Typography>
                  </CardContent>
                </Card>
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <Typography variant="h6">Accent Card</Typography>
                    <Typography variant="body2">Highlighted with primary colors</Typography>
                  </CardContent>
                </Card>
                <Card className="shadow-lg">
                  <CardContent className="p-4">
                    <Typography variant="h6">Elevated Card</Typography>
                    <Typography variant="body2">Enhanced shadow styling</Typography>
                  </CardContent>
                </Card>
              </div>

              {/* Footer */}
              <div className="text-center py-6">
                <Typography variant="body2" intent="secondary">
                  Built with shadcn/ui, Tailwind CSS, and React
                </Typography>
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;

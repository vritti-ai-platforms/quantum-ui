import type { Meta, StoryObj } from '@storybook/react';
import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Plus,
  PlusCircle,
  Settings,
  Trash,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import * as React from 'react';
import { Button } from '../Button';
import { Avatar, AvatarFallback, AvatarImage } from '../Avatar';
import {
  DropdownMenu,
  DropdownMenuRoot,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './DropdownMenu';
import type { MenuItem } from './types';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    align: {
      control: { type: 'select' },
      options: ['start', 'center', 'end'],
      description: 'Horizontal alignment of the dropdown relative to the trigger',
    },
    side: {
      control: { type: 'select' },
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Which side of the trigger to render the dropdown',
    },
    contentClassName: {
      control: 'text',
      description: 'Additional CSS classes for the dropdown content',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic stories using declarative API
export const Default: Story = {
  args: {
    trigger: { label: 'Open Menu' },
    items: [
      { type: 'item', id: 'profile', label: 'Profile' },
      { type: 'item', id: 'settings', label: 'Settings' },
      { type: 'separator' },
      { type: 'item', id: 'logout', label: 'Log out' },
    ],
  },
};

export const WithIcons: Story = {
  args: {
    trigger: { label: 'My Account', variant: 'outline' },
    items: [
      { type: 'label', id: 'account-label', label: 'My Account' },
      { type: 'item', id: 'profile', label: 'Profile', icon: User, shortcut: '⌘P' },
      { type: 'item', id: 'settings', label: 'Settings', icon: Settings, shortcut: '⌘S' },
      { type: 'item', id: 'billing', label: 'Billing', icon: CreditCard, shortcut: '⌘B' },
      { type: 'separator' },
      { type: 'item', id: 'logout', label: 'Log out', icon: LogOut },
    ],
    align: 'end',
  },
};

export const WithKeyboardShortcuts: Story = {
  args: {
    trigger: { label: 'Actions', variant: 'secondary' },
    items: [
      { type: 'item', id: 'new-file', label: 'New File', shortcut: '⌘N' },
      { type: 'item', id: 'open', label: 'Open...', shortcut: '⌘O' },
      { type: 'item', id: 'save', label: 'Save', shortcut: '⌘S' },
      { type: 'item', id: 'save-as', label: 'Save As...', shortcut: '⇧⌘S' },
      { type: 'separator' },
      { type: 'item', id: 'export', label: 'Export', shortcut: '⌘E' },
      { type: 'item', id: 'print', label: 'Print...', shortcut: '⌘P' },
    ],
  },
};

export const WithCheckboxItems: Story = {
  render: () => {
    const [showStatusBar, setShowStatusBar] = React.useState(true);
    const [showActivityBar, setShowActivityBar] = React.useState(false);
    const [showPanel, setShowPanel] = React.useState(true);

    const items: MenuItem[] = [
      { type: 'label', id: 'appearance', label: 'Appearance' },
      {
        type: 'checkbox',
        id: 'status-bar',
        label: 'Status Bar',
        checked: showStatusBar,
        onCheckedChange: setShowStatusBar,
      },
      {
        type: 'checkbox',
        id: 'activity-bar',
        label: 'Activity Bar',
        checked: showActivityBar,
        onCheckedChange: setShowActivityBar,
      },
      {
        type: 'checkbox',
        id: 'panel',
        label: 'Panel',
        checked: showPanel,
        onCheckedChange: setShowPanel,
      },
    ];

    return (
      <div className="space-y-4">
        <DropdownMenu trigger={{ label: 'View', variant: 'outline' }} items={items} />
        <div className="text-sm text-muted-foreground">
          <p>Status Bar: {showStatusBar ? 'Visible' : 'Hidden'}</p>
          <p>Activity Bar: {showActivityBar ? 'Visible' : 'Hidden'}</p>
          <p>Panel: {showPanel ? 'Visible' : 'Hidden'}</p>
        </div>
      </div>
    );
  },
};

export const WithRadioItems: Story = {
  render: () => {
    const [position, setPosition] = React.useState('bottom');

    const items: MenuItem[] = [
      { type: 'label', id: 'panel-position', label: 'Panel Position' },
      { type: 'separator' },
      {
        type: 'radio-group',
        id: 'position',
        value: position,
        onValueChange: setPosition,
        items: [
          { value: 'top', label: 'Top' },
          { value: 'bottom', label: 'Bottom' },
          { value: 'right', label: 'Right' },
        ],
      },
    ];

    return (
      <div className="space-y-4">
        <DropdownMenu trigger={{ label: 'Position', variant: 'outline' }} items={items} />
        <p className="text-sm text-muted-foreground">Current position: {position}</p>
      </div>
    );
  },
};

export const WithSubmenus: Story = {
  args: {
    trigger: { label: 'Menu', icon: MoreHorizontal, variant: 'outline' },
    items: [
      { type: 'item', id: 'new-tab', label: 'New Tab', shortcut: '⌘T' },
      { type: 'item', id: 'new-window', label: 'New Window', shortcut: '⌘N' },
      { type: 'item', id: 'new-private', label: 'New Incognito Window', disabled: true },
      { type: 'separator' },
      {
        type: 'sub',
        id: 'share',
        label: 'Share',
        icon: Users,
        items: [
          { type: 'item', id: 'email', label: 'Email', icon: Mail },
          { type: 'item', id: 'message', label: 'Message', icon: MessageSquare },
          { type: 'separator' },
          { type: 'item', id: 'more', label: 'More...' },
        ],
      },
      {
        type: 'sub',
        id: 'more-tools',
        label: 'More Tools',
        items: [
          { type: 'item', id: 'save-page', label: 'Save Page As...', shortcut: '⌘S' },
          { type: 'item', id: 'create-shortcut', label: 'Create Shortcut...' },
          { type: 'item', id: 'name-window', label: 'Name Window...' },
          { type: 'separator' },
          { type: 'item', id: 'dev-tools', label: 'Developer Tools', shortcut: '⌘⌥I' },
        ],
      },
      { type: 'separator' },
      { type: 'item', id: 'print', label: 'Print...', shortcut: '⌘P' },
    ],
  },
};

export const WithGroups: Story = {
  args: {
    trigger: { label: 'Settings', icon: Settings, variant: 'ghost' },
    items: [
      {
        type: 'group',
        id: 'account-group',
        label: 'Account',
        items: [
          { type: 'item', id: 'profile', label: 'Profile', icon: User },
          { type: 'item', id: 'billing', label: 'Billing', icon: CreditCard },
          { type: 'item', id: 'keyboard', label: 'Keyboard shortcuts', icon: Keyboard },
        ],
      },
      { type: 'separator' },
      {
        type: 'group',
        id: 'team-group',
        label: 'Team',
        items: [
          { type: 'item', id: 'team', label: 'Team', icon: Users },
          {
            type: 'sub',
            id: 'invite-users',
            label: 'Invite users',
            icon: UserPlus,
            items: [
              { type: 'item', id: 'email-invite', label: 'Email', icon: Mail },
              { type: 'item', id: 'message-invite', label: 'Message', icon: MessageSquare },
              { type: 'separator' },
              { type: 'item', id: 'more-invite', label: 'More...', icon: PlusCircle },
            ],
          },
          { type: 'item', id: 'new-team', label: 'New Team', icon: Plus, shortcut: '⌘+T' },
        ],
      },
      { type: 'separator' },
      { type: 'item', id: 'github', label: 'GitHub', icon: Github },
      { type: 'item', id: 'support', label: 'Support', icon: LifeBuoy },
      { type: 'item', id: 'api', label: 'API', icon: Cloud, disabled: true },
      { type: 'separator' },
      { type: 'item', id: 'logout', label: 'Log out', icon: LogOut, shortcut: '⇧⌘Q' },
    ],
  },
};

export const WithSeparatorsAndLabels: Story = {
  args: {
    trigger: { label: 'Edit', variant: 'outline' },
    items: [
      { type: 'label', id: 'edit-label', label: 'Edit Actions' },
      { type: 'item', id: 'undo', label: 'Undo', shortcut: '⌘Z' },
      { type: 'item', id: 'redo', label: 'Redo', shortcut: '⇧⌘Z' },
      { type: 'separator' },
      { type: 'label', id: 'clipboard-label', label: 'Clipboard' },
      { type: 'item', id: 'cut', label: 'Cut', shortcut: '⌘X' },
      { type: 'item', id: 'copy', label: 'Copy', shortcut: '⌘C' },
      { type: 'item', id: 'paste', label: 'Paste', shortcut: '⌘V' },
      { type: 'separator' },
      { type: 'label', id: 'selection-label', label: 'Selection' },
      { type: 'item', id: 'select-all', label: 'Select All', shortcut: '⌘A' },
    ],
  },
};

export const DestructiveItems: Story = {
  args: {
    trigger: { label: 'More', icon: MoreHorizontal, variant: 'ghost' },
    items: [
      { type: 'item', id: 'edit', label: 'Edit', icon: Settings },
      { type: 'item', id: 'duplicate', label: 'Duplicate', icon: Plus },
      { type: 'separator' },
      { type: 'item', id: 'archive', label: 'Archive' },
      { type: 'item', id: 'move', label: 'Move to Trash', icon: Trash, variant: 'destructive' },
      { type: 'separator' },
      { type: 'item', id: 'delete', label: 'Delete', icon: Trash, variant: 'destructive' },
    ],
    align: 'end',
  },
};

export const DisabledItems: Story = {
  args: {
    trigger: { label: 'Options' },
    items: [
      { type: 'item', id: 'available', label: 'Available Action' },
      { type: 'item', id: 'disabled-1', label: 'Disabled Action', disabled: true },
      { type: 'item', id: 'another', label: 'Another Action' },
      { type: 'separator' },
      { type: 'item', id: 'disabled-2', label: 'Premium Feature', disabled: true, icon: CreditCard },
      { type: 'item', id: 'disabled-3', label: 'Admin Only', disabled: true, icon: Settings },
    ],
  },
};

// Different trigger variants
export const TriggerVariants: Story = {
  render: () => {
    const items: MenuItem[] = [
      { type: 'item', id: 'option-1', label: 'Option 1' },
      { type: 'item', id: 'option-2', label: 'Option 2' },
      { type: 'item', id: 'option-3', label: 'Option 3' },
    ];

    return (
      <div className="flex flex-wrap gap-4">
        <DropdownMenu trigger={{ label: 'Default', variant: 'default' }} items={items} />
        <DropdownMenu trigger={{ label: 'Secondary', variant: 'secondary' }} items={items} />
        <DropdownMenu trigger={{ label: 'Outline', variant: 'outline' }} items={items} />
        <DropdownMenu trigger={{ label: 'Ghost', variant: 'ghost' }} items={items} />
        <DropdownMenu trigger={{ label: 'Destructive', variant: 'destructive' }} items={items} />
        <DropdownMenu trigger={{ label: 'Link', variant: 'link' }} items={items} />
      </div>
    );
  },
};

export const TriggerWithIcon: Story = {
  args: {
    trigger: { label: 'Settings', icon: Settings, variant: 'outline' },
    items: [
      { type: 'item', id: 'general', label: 'General', icon: Settings },
      { type: 'item', id: 'account', label: 'Account', icon: User },
      { type: 'item', id: 'notifications', label: 'Notifications', icon: Mail },
    ],
  },
};

export const IconOnlyTrigger: Story = {
  render: () => {
    const items: MenuItem[] = [
      { type: 'item', id: 'edit', label: 'Edit', icon: Settings },
      { type: 'item', id: 'duplicate', label: 'Duplicate', icon: Plus },
      { type: 'separator' },
      { type: 'item', id: 'delete', label: 'Delete', icon: Trash, variant: 'destructive' },
    ];

    return (
      <DropdownMenu
        trigger={{
          children: (
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          ),
        }}
        items={items}
        align="end"
      />
    );
  },
};

export const CustomTrigger: Story = {
  render: () => {
    const items: MenuItem[] = [
      { type: 'label', id: 'account', label: 'My Account' },
      { type: 'item', id: 'profile', label: 'Profile', icon: User },
      { type: 'item', id: 'settings', label: 'Settings', icon: Settings },
      { type: 'separator' },
      { type: 'item', id: 'logout', label: 'Log out', icon: LogOut },
    ];

    return (
      <DropdownMenu
        trigger={{
          children: (
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
            </Button>
          ),
        }}
        items={items}
        align="end"
      />
    );
  },
};

// Alignment and positioning
export const AlignmentOptions: Story = {
  render: () => {
    const items: MenuItem[] = [
      { type: 'item', id: 'option-1', label: 'Option 1' },
      { type: 'item', id: 'option-2', label: 'Option 2' },
      { type: 'item', id: 'option-3', label: 'Option 3' },
    ];

    return (
      <div className="flex gap-8">
        <div className="text-center">
          <DropdownMenu trigger={{ label: 'Align Start' }} items={items} align="start" />
          <p className="text-xs text-muted-foreground mt-2">align="start"</p>
        </div>
        <div className="text-center">
          <DropdownMenu trigger={{ label: 'Align Center' }} items={items} align="center" />
          <p className="text-xs text-muted-foreground mt-2">align="center"</p>
        </div>
        <div className="text-center">
          <DropdownMenu trigger={{ label: 'Align End' }} items={items} align="end" />
          <p className="text-xs text-muted-foreground mt-2">align="end"</p>
        </div>
      </div>
    );
  },
};

export const SideOptions: Story = {
  render: () => {
    const items: MenuItem[] = [
      { type: 'item', id: 'option-1', label: 'Option 1' },
      { type: 'item', id: 'option-2', label: 'Option 2' },
    ];

    return (
      <div className="flex flex-wrap gap-8 p-8">
        <div className="text-center">
          <DropdownMenu trigger={{ label: 'Bottom' }} items={items} side="bottom" />
          <p className="text-xs text-muted-foreground mt-2">side="bottom"</p>
        </div>
        <div className="text-center">
          <DropdownMenu trigger={{ label: 'Top' }} items={items} side="top" />
          <p className="text-xs text-muted-foreground mt-2">side="top"</p>
        </div>
        <div className="text-center">
          <DropdownMenu trigger={{ label: 'Right' }} items={items} side="right" />
          <p className="text-xs text-muted-foreground mt-2">side="right"</p>
        </div>
        <div className="text-center">
          <DropdownMenu trigger={{ label: 'Left' }} items={items} side="left" />
          <p className="text-xs text-muted-foreground mt-2">side="left"</p>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
  },
};

// Custom content with render function
export const WithCustomContent: Story = {
  render: () => {
    const items: MenuItem[] = [
      {
        type: 'custom',
        id: 'user-header',
        render: (
          <div className="flex items-center gap-3 px-2 py-1.5">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">John Doe</span>
              <span className="text-xs text-muted-foreground">john@example.com</span>
            </div>
          </div>
        ),
      },
      { type: 'separator' },
      { type: 'item', id: 'profile', label: 'Profile', icon: User },
      { type: 'item', id: 'settings', label: 'Settings', icon: Settings },
      { type: 'separator' },
      { type: 'item', id: 'logout', label: 'Log out', icon: LogOut },
    ];

    return <DropdownMenu trigger={{ label: 'User Menu', variant: 'outline' }} items={items} />;
  },
};

export const CustomItemAsMenuItem: Story = {
  render: () => {
    const items: MenuItem[] = [
      { type: 'label', id: 'quick-actions', label: 'Quick Actions' },
      {
        type: 'custom',
        id: 'custom-action-1',
        asMenuItem: true,
        onClick: () => alert('Custom action clicked!'),
        render: (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-primary" />
            <span>Custom Styled Item</span>
          </div>
        ),
      },
      {
        type: 'custom',
        id: 'custom-action-2',
        asMenuItem: true,
        onClick: () => alert('Badge item clicked!'),
        render: (
          <div className="flex items-center justify-between w-full">
            <span>Notifications</span>
            <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">12</span>
          </div>
        ),
      },
      { type: 'separator' },
      { type: 'item', id: 'regular', label: 'Regular Item' },
    ];

    return <DropdownMenu trigger={{ label: 'Custom Items', variant: 'outline' }} items={items} />;
  },
};

// Primitive components example for full control
export const PrimitiveComponents: Story = {
  render: () => {
    const [bookmarksChecked, setBookmarksChecked] = React.useState(true);
    const [urlsChecked, setUrlsChecked] = React.useState(false);
    const [person, setPerson] = React.useState('pedro');

    return (
      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Primitive Components</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing</span>
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Keyboard shortcuts</span>
              <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              <span>Team</span>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Invite users</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>
                    <Mail className="mr-2 h-4 w-4" />
                    <span>Email</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Message</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>More...</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
            <DropdownMenuItem>
              <Plus className="mr-2 h-4 w-4" />
              <span>New Team</span>
              <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={bookmarksChecked} onCheckedChange={setBookmarksChecked}>
            Show Bookmarks
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={urlsChecked} onCheckedChange={setUrlsChecked}>
            Show Full URLs
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>People</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={person} onValueChange={setPerson}>
            <DropdownMenuRadioItem value="pedro">Pedro Duarte</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="colm">Colm Tuite</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Github className="mr-2 h-4 w-4" />
            <span>GitHub</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LifeBuoy className="mr-2 h-4 w-4" />
            <span>Support</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Cloud className="mr-2 h-4 w-4" />
            <span>API</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>
    );
  },
};

// Real-world use cases
export const TableRowActions: Story = {
  render: () => {
    const items: MenuItem[] = [
      { type: 'label', id: 'actions', label: 'Actions' },
      { type: 'item', id: 'view', label: 'View details' },
      { type: 'item', id: 'edit', label: 'Edit', icon: Settings },
      { type: 'item', id: 'copy-id', label: 'Copy ID', shortcut: '⌘C' },
      { type: 'separator' },
      { type: 'item', id: 'delete', label: 'Delete', icon: Trash, variant: 'destructive' },
    ];

    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium">Project Alpha</p>
            <p className="text-xs text-muted-foreground">Created: Jan 15, 2024</p>
          </div>
          <DropdownMenu
            trigger={{
              children: (
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              ),
            }}
            items={items}
            align="end"
          />
        </div>
      </div>
    );
  },
};

export const UserProfileMenu: Story = {
  render: () => {
    const [notifications, setNotifications] = React.useState(true);
    const [theme, setTheme] = React.useState('system');

    const items: MenuItem[] = [
      {
        type: 'custom',
        id: 'user-info',
        render: (
          <div className="flex items-center gap-3 px-2 py-1.5">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">John Doe</span>
              <span className="text-xs text-muted-foreground">john@example.com</span>
            </div>
          </div>
        ),
      },
      { type: 'separator' },
      {
        type: 'group',
        id: 'account-settings',
        items: [
          { type: 'item', id: 'profile', label: 'Profile', icon: User, shortcut: '⌘P' },
          { type: 'item', id: 'settings', label: 'Settings', icon: Settings, shortcut: '⌘S' },
          { type: 'item', id: 'billing', label: 'Billing', icon: CreditCard },
        ],
      },
      { type: 'separator' },
      { type: 'label', id: 'preferences', label: 'Preferences' },
      {
        type: 'checkbox',
        id: 'notifications',
        label: 'Notifications',
        checked: notifications,
        onCheckedChange: setNotifications,
      },
      {
        type: 'sub',
        id: 'theme',
        label: 'Theme',
        items: [
          {
            type: 'radio-group',
            id: 'theme-selection',
            value: theme,
            onValueChange: setTheme,
            items: [
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ],
          },
        ],
      },
      { type: 'separator' },
      { type: 'item', id: 'support', label: 'Support', icon: LifeBuoy },
      { type: 'separator' },
      { type: 'item', id: 'logout', label: 'Log out', icon: LogOut, variant: 'destructive' },
    ];

    return (
      <DropdownMenu
        trigger={{
          children: (
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          ),
        }}
        items={items}
        align="end"
        contentClassName="w-64"
      />
    );
  },
};

export const FileContextMenu: Story = {
  render: () => {
    const items: MenuItem[] = [
      {
        type: 'group',
        id: 'file-actions',
        items: [
          { type: 'item', id: 'open', label: 'Open', shortcut: '⌘O' },
          { type: 'item', id: 'open-with', label: 'Open with...' },
          { type: 'item', id: 'reveal', label: 'Reveal in Finder', shortcut: '⌘⇧R' },
        ],
      },
      { type: 'separator' },
      {
        type: 'group',
        id: 'edit-actions',
        items: [
          { type: 'item', id: 'cut', label: 'Cut', shortcut: '⌘X' },
          { type: 'item', id: 'copy', label: 'Copy', shortcut: '⌘C' },
          { type: 'item', id: 'paste', label: 'Paste', shortcut: '⌘V', disabled: true },
        ],
      },
      { type: 'separator' },
      {
        type: 'sub',
        id: 'share',
        label: 'Share',
        items: [
          { type: 'item', id: 'copy-link', label: 'Copy Link' },
          { type: 'item', id: 'email', label: 'Email', icon: Mail },
          { type: 'item', id: 'airdrop', label: 'AirDrop' },
        ],
      },
      { type: 'separator' },
      { type: 'item', id: 'rename', label: 'Rename', shortcut: '⏎' },
      { type: 'item', id: 'duplicate', label: 'Duplicate', shortcut: '⌘D' },
      { type: 'separator' },
      {
        type: 'item',
        id: 'move-to-trash',
        label: 'Move to Trash',
        icon: Trash,
        variant: 'destructive',
        shortcut: '⌘⌫',
      },
    ];

    return (
      <div className="flex items-center gap-4 rounded-lg border p-4">
        <div className="rounded bg-muted p-3">
          <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Document.pdf</p>
          <p className="text-xs text-muted-foreground">2.4 MB</p>
        </div>
        <DropdownMenu
          trigger={{
            children: (
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">File options</span>
              </Button>
            ),
          }}
          items={items}
          align="end"
        />
      </div>
    );
  },
};

// Complex nested example
export const DeeplyNestedMenus: Story = {
  args: {
    trigger: { label: 'Complex Menu', variant: 'outline' },
    items: [
      { type: 'item', id: 'home', label: 'Home' },
      {
        type: 'sub',
        id: 'products',
        label: 'Products',
        items: [
          { type: 'item', id: 'all-products', label: 'All Products' },
          {
            type: 'sub',
            id: 'categories',
            label: 'Categories',
            items: [
              { type: 'item', id: 'electronics', label: 'Electronics' },
              { type: 'item', id: 'clothing', label: 'Clothing' },
              {
                type: 'sub',
                id: 'home-garden',
                label: 'Home & Garden',
                items: [
                  { type: 'item', id: 'furniture', label: 'Furniture' },
                  { type: 'item', id: 'decor', label: 'Decor' },
                  { type: 'item', id: 'outdoor', label: 'Outdoor' },
                ],
              },
            ],
          },
          { type: 'separator' },
          { type: 'item', id: 'new-arrivals', label: 'New Arrivals' },
          { type: 'item', id: 'sale', label: 'Sale' },
        ],
      },
      {
        type: 'sub',
        id: 'account',
        label: 'Account',
        items: [
          { type: 'item', id: 'dashboard', label: 'Dashboard' },
          {
            type: 'sub',
            id: 'orders',
            label: 'Orders',
            items: [
              { type: 'item', id: 'active-orders', label: 'Active Orders' },
              { type: 'item', id: 'order-history', label: 'Order History' },
              { type: 'item', id: 'returns', label: 'Returns' },
            ],
          },
          { type: 'item', id: 'wishlist', label: 'Wishlist' },
        ],
      },
      { type: 'separator' },
      { type: 'item', id: 'contact', label: 'Contact Us' },
    ],
  },
};

// All features combined
export const AllFeaturesCombined: Story = {
  render: () => {
    const [showInlinePreview, setShowInlinePreview] = React.useState(true);
    const [showFullPath, setShowFullPath] = React.useState(false);
    const [sortBy, setSortBy] = React.useState('name');

    const items: MenuItem[] = [
      { type: 'label', id: 'file-menu', label: 'File Menu' },
      {
        type: 'group',
        id: 'file-group',
        items: [
          { type: 'item', id: 'new', label: 'New File', icon: Plus, shortcut: '⌘N' },
          { type: 'item', id: 'open', label: 'Open...', shortcut: '⌘O' },
          {
            type: 'sub',
            id: 'recent',
            label: 'Open Recent',
            items: [
              { type: 'item', id: 'file1', label: 'project.tsx' },
              { type: 'item', id: 'file2', label: 'styles.css' },
              { type: 'item', id: 'file3', label: 'README.md' },
              { type: 'separator' },
              { type: 'item', id: 'clear', label: 'Clear Recent' },
            ],
          },
        ],
      },
      { type: 'separator' },
      { type: 'label', id: 'view-settings', label: 'View Settings' },
      {
        type: 'checkbox',
        id: 'inline-preview',
        label: 'Inline Preview',
        checked: showInlinePreview,
        onCheckedChange: setShowInlinePreview,
      },
      {
        type: 'checkbox',
        id: 'full-path',
        label: 'Show Full Path',
        checked: showFullPath,
        onCheckedChange: setShowFullPath,
      },
      { type: 'separator' },
      { type: 'label', id: 'sort-label', label: 'Sort By' },
      {
        type: 'radio-group',
        id: 'sort-options',
        value: sortBy,
        onValueChange: setSortBy,
        items: [
          { value: 'name', label: 'Name' },
          { value: 'date', label: 'Date Modified' },
          { value: 'size', label: 'Size' },
          { value: 'type', label: 'Type' },
        ],
      },
      { type: 'separator' },
      {
        type: 'custom',
        id: 'status',
        render: (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            Sorting by: {sortBy} | Preview: {showInlinePreview ? 'On' : 'Off'}
          </div>
        ),
      },
      { type: 'separator' },
      { type: 'item', id: 'close', label: 'Close', shortcut: '⌘W', variant: 'destructive' },
    ];

    return (
      <div className="space-y-4">
        <DropdownMenu trigger={{ label: 'File', variant: 'outline' }} items={items} contentClassName="w-56" />
        <div className="text-sm text-muted-foreground space-y-1">
          <p>Inline Preview: {showInlinePreview ? 'Enabled' : 'Disabled'}</p>
          <p>Full Path: {showFullPath ? 'Shown' : 'Hidden'}</p>
          <p>Sort By: {sortBy}</p>
        </div>
      </div>
    );
  },
};

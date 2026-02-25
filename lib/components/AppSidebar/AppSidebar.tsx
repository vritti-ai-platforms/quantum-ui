import { ChevronRight } from 'lucide-react';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Collapsible as ShadcnCollapsible,
  CollapsibleContent as ShadcnCollapsibleContent,
  CollapsibleTrigger as ShadcnCollapsibleTrigger,
} from '../../../shadcn/shadcnCollapsible';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent as ShadcnSidebarContent,
  SidebarControl as ShadcnSidebarControl,
  SidebarFooter as ShadcnSidebarFooter,
  SidebarGroup as ShadcnSidebarGroup,
  SidebarGroupContent as ShadcnSidebarGroupContent,
  SidebarGroupLabel as ShadcnSidebarGroupLabel,
  SidebarMenu as ShadcnSidebarMenu,
  SidebarMenuButton as ShadcnSidebarMenuButton,
  SidebarMenuItem as ShadcnSidebarMenuItem,
  SidebarMenuSub as ShadcnSidebarMenuSub,
  SidebarMenuSubButton as ShadcnSidebarMenuSubButton,
  SidebarMenuSubItem as ShadcnSidebarMenuSubItem,
  SidebarRail as ShadcnSidebarRail,
  useSidebarMode as shadcnUseSidebarMode,
} from '../../../shadcn/shadcnSidebar';

export interface SidebarNavChild {
  title: string;
  path: string;
}

export interface SidebarNavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  children?: SidebarNavChild[];
}

export interface SidebarNavGroup {
  label: string;
  items: SidebarNavItem[];
}

export interface AppSidebarProps {
  groups: SidebarNavGroup[];
  topOffset?: number;
}

// Renders a collapsible menu item with a submenu
const CollapsibleItem: React.FC<{
  item: SidebarNavItem;
  pathname: string;
  navigate: (path: string) => void;
}> = ({ item, pathname, navigate }) => (
  <ShadcnCollapsible
    defaultOpen={item.children?.some((child) => pathname === child.path)}
    className="group/collapsible"
  >
    <ShadcnSidebarMenuItem>
      <ShadcnCollapsibleTrigger asChild>
        <ShadcnSidebarMenuButton
          tooltip={item.title}
          isActive={pathname.startsWith(item.path)}
        >
          <item.icon />
          <span>{item.title}</span>
          <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
        </ShadcnSidebarMenuButton>
      </ShadcnCollapsibleTrigger>
      <ShadcnCollapsibleContent>
        <ShadcnSidebarMenuSub>
          {item.children?.map((child) => (
            <ShadcnSidebarMenuSubItem key={child.path}>
              <ShadcnSidebarMenuSubButton
                isActive={pathname === child.path}
                onClick={() => navigate(child.path)}
              >
                <span>{child.title}</span>
              </ShadcnSidebarMenuSubButton>
            </ShadcnSidebarMenuSubItem>
          ))}
        </ShadcnSidebarMenuSub>
      </ShadcnCollapsibleContent>
    </ShadcnSidebarMenuItem>
  </ShadcnCollapsible>
);

// Renders a flat menu item without children
const FlatItem: React.FC<{
  item: SidebarNavItem;
  pathname: string;
  navigate: (path: string) => void;
}> = ({ item, pathname, navigate }) => (
  <ShadcnSidebarMenuItem>
    <ShadcnSidebarMenuButton
      tooltip={item.title}
      isActive={pathname === item.path}
      onClick={() => navigate(item.path)}
    >
      <item.icon />
      <span>{item.title}</span>
    </ShadcnSidebarMenuButton>
  </ShadcnSidebarMenuItem>
);

// Data-driven sidebar that renders grouped nav items with collapsible support
export const AppSidebar: React.FC<AppSidebarProps> = ({ groups, topOffset = 14 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarProps, controlProps } = shadcnUseSidebarMode();

  return (
    <ShadcnSidebar
      {...sidebarProps}
      collapsible="icon"
      style={{
        top: `calc(var(--spacing) * ${topOffset})`,
        height: `calc(100svh - calc(var(--spacing) * ${topOffset}))`,
      }}
    >
      <ShadcnSidebarContent>
        {groups.map((group) => (
          <ShadcnSidebarGroup key={group.label}>
            <ShadcnSidebarGroupLabel>{group.label}</ShadcnSidebarGroupLabel>
            <ShadcnSidebarGroupContent>
              <ShadcnSidebarMenu>
                {group.items.map((item) =>
                  item.children ? (
                    <CollapsibleItem
                      key={item.title}
                      item={item}
                      pathname={location.pathname}
                      navigate={navigate}
                    />
                  ) : (
                    <FlatItem
                      key={item.title}
                      item={item}
                      pathname={location.pathname}
                      navigate={navigate}
                    />
                  ),
                )}
              </ShadcnSidebarMenu>
            </ShadcnSidebarGroupContent>
          </ShadcnSidebarGroup>
        ))}
      </ShadcnSidebarContent>

      <ShadcnSidebarFooter>
        <ShadcnSidebarControl {...controlProps} />
      </ShadcnSidebarFooter>

      <ShadcnSidebarRail />
    </ShadcnSidebar>
  );
};

AppSidebar.displayName = 'AppSidebar';

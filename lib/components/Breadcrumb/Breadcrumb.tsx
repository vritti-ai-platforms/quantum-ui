import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../../shadcn/shadcnBreadcrumb';
import { cn } from '../../../shadcn/utils';

export interface BreadcrumbProps extends React.ComponentProps<'nav'> {
  // Full path → display label (e.g. { '/settings/profile': 'Profile' })
  routes?: Record<string, string>;
  // Custom separator node (defaults to ChevronRight in the primitive)
  separator?: React.ReactNode;
  // Max visible segments before collapsing middle items (0 = no limit)
  maxItems?: number;
}

interface BreadcrumbSegment {
  path: string;
  label: string;
  isLast: boolean;
}

// Converts 'my-account' to 'My Account'
function humanizeSegment(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Returns items with null as ellipsis placeholder when count exceeds maxItems
function applyMaxItems(
  items: BreadcrumbSegment[],
  maxItems: number,
): (BreadcrumbSegment | null)[] {
  if (maxItems <= 0 || items.length <= maxItems) return items;
  // Show first 1 + ellipsis + last (maxItems - 1)
  const tailCount = maxItems - 1;
  return [
    ...items.slice(0, 1),
    null,
    ...items.slice(items.length - tailCount),
  ];
}

// Route-aware breadcrumb driven by the current URL pathname
export function Breadcrumb({
  routes = {},
  separator,
  maxItems = 0,
  className,
  ...props
}: BreadcrumbProps) {
  const { pathname } = useLocation();

  const segments = pathname.split('/').filter(Boolean);

  const items: BreadcrumbSegment[] = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    return {
      path,
      label: routes[path] ?? humanizeSegment(segment),
      isLast: index === segments.length - 1,
    };
  });

  const visibleItems = applyMaxItems(items, maxItems);

  if (items.length === 0) return null;

  return (
    <ShadcnBreadcrumb className={cn(className)} {...props}>
      <BreadcrumbList>
        {visibleItems.map((item, index) => {
          if (item === null) {
            return (
              <React.Fragment key="ellipsis">
                <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbEllipsis />
                </BreadcrumbItem>
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={item.path}>
              {index > 0 && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
              <BreadcrumbItem>
                {item.isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.path}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </ShadcnBreadcrumb>
  );
}

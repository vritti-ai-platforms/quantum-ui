import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumb as ShadcnBreadcrumb,
} from '../../../shadcn/shadcnBreadcrumb';
import { cn } from '../../../shadcn/utils';

// Parsed segment shape exposed to consumers via renderSegment
export interface BreadcrumbSegment {
  path: string;
  raw: string;
  label: string;
  slug: string | null;
  id: string | null;
  isLast: boolean;
}

export interface BreadcrumbProps extends React.ComponentProps<'nav'> {
  // Full path → display label (e.g. { '/settings/profile': 'Profile' })
  routes?: Record<string, string>;
  // Custom separator node (defaults to ChevronRight in the primitive)
  separator?: React.ReactNode;
  // Max visible segments before collapsing middle items (0 = no limit)
  maxItems?: number;
  // Custom renderer — return ReactNode to override, or null/undefined for default
  renderSegment?: (segment: BreadcrumbSegment) => React.ReactNode | null | undefined;
}

// Converts 'my-account' to 'My Account'
function humanizeSegment(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Returns items with null as ellipsis placeholder when count exceeds maxItems
function applyMaxItems(items: BreadcrumbSegment[], maxItems: number): (BreadcrumbSegment | null)[] {
  if (maxItems <= 0 || items.length <= maxItems) return items;
  // Show first 1 + ellipsis + last (maxItems - 1)
  const tailCount = maxItems - 1;
  return [...items.slice(0, 1), null, ...items.slice(items.length - tailCount)];
}

// Route-aware breadcrumb driven by the current URL pathname
export function Breadcrumb({
  routes = {},
  separator,
  maxItems = 0,
  renderSegment,
  className,
  ...props
}: BreadcrumbProps) {
  const { pathname } = useLocation();

  const segments = pathname.split('/').filter(Boolean);

  const items: BreadcrumbSegment[] = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const tildeIdx = segment.indexOf('~');
    const slug = tildeIdx >= 0 ? segment.slice(0, tildeIdx) : null;
    const id = tildeIdx >= 0 ? segment.slice(tildeIdx + 1) : null;
    const label = routes[path] ?? humanizeSegment(slug ?? segment);

    return {
      path,
      raw: segment,
      label,
      slug,
      id,
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

          // Check for custom rendering
          const customNode = renderSegment?.(item);
          if (customNode !== null && customNode !== undefined) {
            return (
              <React.Fragment key={item.path}>
                {index > 0 && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
                <BreadcrumbItem>{customNode}</BreadcrumbItem>
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

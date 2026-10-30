import type React from 'react';
import { Children, Fragment, isValidElement } from 'react';

// The gate a field carries; Form copies it onto the Controller it wraps the field in
export interface FieldGateProps {
  permission?: string;
}

interface FieldScan {
  fields: number;
  codes: string[];
}

// Same walk as Form's processChildren: a field is any non-Fragment element with a string `name`
// (a raw field, or the Controller Form wrapped it in); anything else is recursed into via `children`
function scanFields(children: React.ReactNode, scan: FieldScan): FieldScan {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const props = child.props as { name?: unknown; children?: React.ReactNode } & FieldGateProps;
    if (child.type !== Fragment && typeof props.name === 'string') {
      scan.fields += 1;
      if (props.permission) scan.codes.push(props.permission);
      return;
    }
    if (props.children != null) scanFields(props.children, scan);
  });
  return scan;
}

// Codes that decide whether a section renders: every field's code when all its fields are gated, else
// none (an ungated field, or no fields at all, keeps the section visible)
export function sectionPermissionCodes(children: React.ReactNode): string[] {
  const { fields, codes } = scanFields(children, { fields: 0, codes: [] });
  return fields > 0 && codes.length === fields ? codes : [];
}

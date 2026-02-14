export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  groupId?: string | number;
}

export interface SelectGroup {
  id: string | number;
  name: string;
}

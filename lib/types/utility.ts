// Omit applied to each member of a union, so a discriminated props union keeps its branches (plain Omit flattens them)
export type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

import type React from 'react';

interface DetailFieldProps {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}

export const DetailField: React.FC<DetailFieldProps> = ({ label, value, className }) => {
  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium mt-1">{value}</p>
    </div>
  );
};

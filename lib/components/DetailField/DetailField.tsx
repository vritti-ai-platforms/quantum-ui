import type React from 'react';
import { useFormatters } from '../../hooks/useFormatters';
import type { CurrencyAmount } from '../../utils/format';
import { Skeleton } from '../Skeleton';

export type DetailFieldType = 'string' | 'number' | 'currency' | 'date' | 'dateTime';

export type { CurrencyAmount };

interface DetailFieldBase {
  label: React.ReactNode;
  className?: string;
  loading?: boolean;
}

interface DetailFieldStringProps extends DetailFieldBase {
  type: 'string';
  value: React.ReactNode;
  mono?: boolean;
}

interface DetailFieldNumberProps extends DetailFieldBase {
  type: 'number';
  value: number | string | null | undefined;
  fractionDigits?: number;
}

interface DetailFieldCurrencyProps extends DetailFieldBase {
  type: 'currency';
  value: CurrencyAmount | null | undefined;
  exchangeRate?: number | null;
}

interface DetailFieldDateProps extends DetailFieldBase {
  type: 'date';
  value: string | null | undefined;
}

interface DetailFieldDateTimeProps extends DetailFieldBase {
  type: 'dateTime';
  value: string | null | undefined;
  timeZone?: string;
}

export type DetailFieldProps =
  | DetailFieldStringProps
  | DetailFieldNumberProps
  | DetailFieldCurrencyProps
  | DetailFieldDateProps
  | DetailFieldDateTimeProps;

export const DetailField: React.FC<DetailFieldProps> = (props) => {
  const { label, className, loading } = props;
  const fmt = useFormatters();

  if (loading) {
    return (
      <div className={className}>
        <p className="text-sm text-muted-foreground">{label}</p>
        <Skeleton className="mt-1 h-5 w-32" />
      </div>
    );
  }

  let primary: React.ReactNode;
  let secondary: string | undefined;
  let isMono = false;

  switch (props.type) {
    case 'string': {
      ({ primary, secondary } = fmt.string(props.value));
      isMono = !!props.mono;
      break;
    }
    case 'number': {
      ({ primary, secondary } = fmt.number(props.value, { fractionDigits: props.fractionDigits }));
      isMono = true;
      break;
    }
    case 'currency': {
      ({ primary, secondary } = fmt.currency(props.value, { exchangeRate: props.exchangeRate }));
      isMono = true;
      break;
    }
    case 'date': {
      ({ primary, secondary } = fmt.date(props.value));
      break;
    }
    case 'dateTime': {
      ({ primary, secondary } = fmt.dateTime(props.value, { timeZone: props.timeZone }));
      break;
    }
  }

  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={`font-medium mt-1${isMono ? ' font-mono' : ''}`}>{primary}</p>
      {secondary && <p className="mt-1 text-xs text-muted-foreground">{secondary}</p>}
    </div>
  );
};

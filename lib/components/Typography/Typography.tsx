import type React from 'react';
import { cn } from '../../../shadcn/utils';

export interface TypographyProps {
  /**
   * The content to render
   */
  children: React.ReactNode;

  /**
   * The semantic variant of the typography
   */
  variant?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'body1'
    | 'body2'
    | 'caption'
    | 'overline'
    | 'subtitle1'
    | 'subtitle2'
    | 'button'
    | 'code'
    | 'blockquote';

  /**
   * The color intent of the text
   */
  intent?: 'default' | 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error';

  /**
   * Whether text should be centered
   */
  align?: 'left' | 'center' | 'right' | 'justify';

  /**
   * Custom className
   */
  className?: string;
}

const variantMap = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body1: 'p',
  body2: 'p',
  caption: 'span',
  overline: 'span',
  subtitle1: 'h6',
  subtitle2: 'h6',
  button: 'span',
  code: 'code',
  blockquote: 'blockquote',
} as const;

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body1',
  intent = 'default',
  align = 'left',
  className,
  ...props
}) => {
  const Component = variantMap[variant];

  const getVariantClasses = () => {
    switch (variant) {
      case 'h1':
        return 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl';
      case 'h2':
        return 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0';
      case 'h3':
        return 'scroll-m-20 text-2xl font-semibold tracking-tight';
      case 'h4':
        return 'scroll-m-20 text-xl font-semibold tracking-tight';
      case 'h5':
        return 'scroll-m-20 text-lg font-semibold tracking-tight';
      case 'h6':
        return 'scroll-m-20 text-base font-semibold tracking-tight';
      case 'body1':
        return 'leading-7';
      case 'body2':
        return 'text-sm leading-6';
      case 'caption':
        return 'text-xs text-muted-foreground';
      case 'overline':
        return 'text-xs font-medium uppercase tracking-wide text-muted-foreground';
      case 'subtitle1':
        return 'text-lg font-medium';
      case 'subtitle2':
        return 'text-sm font-medium';
      case 'button':
        return 'text-sm font-medium';
      case 'code':
        return 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold';
      case 'blockquote':
        return 'mt-6 border-l-2 pl-6 italic';
      default:
        return 'leading-7';
    }
  };

  const getIntentClasses = () => {
    switch (intent) {
      case 'primary':
        return 'text-primary';
      case 'secondary':
        return 'text-secondary-foreground';
      case 'muted':
        return 'text-muted-foreground';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-foreground';
    }
  };

  const getAlignClasses = () => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      case 'justify':
        return 'text-justify';
      default:
        return 'text-left';
    }
  };

  return (
    <Component className={cn(getVariantClasses(), getIntentClasses(), getAlignClasses(), className)} {...props}>
      {children}
    </Component>
  );
};

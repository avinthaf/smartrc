import type { ComponentProps } from 'react';
import { cn } from '../lib/utils';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadingVariant = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

type HeadingProps = ComponentProps<'h1'> & {
  as?: HeadingLevel;
  variant?: HeadingVariant;
  className?: string;
};

const variantStyles: Record<HeadingVariant, string> = {
  xl: 'text-4xl font-extrabold tracking-tight text-foreground',
  lg: 'text-3xl font-bold text-foreground',
  md: 'text-2xl font-semibold text-foreground',
  sm: 'text-xl font-medium text-foreground',
  xs: 'text-lg font-medium text-foreground',
};

export function Heading({
  as: Component = 'h2',
  variant = 'lg',
  className = '',
  ...props
}: HeadingProps) {
  return (
    <Component
      className={cn(variantStyles[variant], className)}
      {...props}
    />
  );
}

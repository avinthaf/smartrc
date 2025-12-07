import type { ComponentProps } from 'react';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadingVariant = 'xl' | 'lg' | 'md' | 'sm' | 'xs';

type HeadingProps = ComponentProps<'h1'> & {
  as?: HeadingLevel;
  variant?: HeadingVariant;
  className?: string;
};

const variantStyles: Record<HeadingVariant, string> = {
  xl: 'text-4xl font-extrabold tracking-tight',
  lg: 'text-3xl font-bold',
  md: 'text-2xl font-semibold',
  sm: 'text-xl font-medium',
  xs: 'text-lg font-medium',
};

export function Heading({
  as: Component = 'h2',
  variant = 'lg',
  className = '',
  ...props
}: HeadingProps) {
  return (
    <Component
      className={`text-gray-900 ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}

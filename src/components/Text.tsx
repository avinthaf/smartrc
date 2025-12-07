import type { ElementType, ComponentPropsWithoutRef, ReactNode } from 'react';

type TextVariant = 'body' | 'small' | 'xsmall';
type TextColor = 'default' | 'muted' | 'primary' | 'error';

type TextProps<C extends ElementType = 'p'> = {
  as?: C;
  variant?: TextVariant;
  color?: TextColor;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<C>, 'as' | 'className'>;

const variantStyles: Record<TextVariant, string> = {
  body: 'text-base',
  small: 'text-sm',
  xsmall: 'text-xs',
};

const colorStyles: Record<TextColor, string> = {
  default: 'text-gray-900',
  muted: 'text-gray-600',
  primary: 'text-blue-600 hover:text-blue-500',
  error: 'text-red-600',
};

export function Text<C extends ElementType = 'p'>({
  as,
  variant = 'body',
  color = 'default',
  className = '',
  ...props
}: TextProps<C>) {
  const Component = as || 'p';
  
  return (
    <Component
      {...props}
      className={`${variantStyles[variant]} ${colorStyles[color]} ${className}`.trim()}
    />
  );
}

type LinkTextProps = Omit<TextProps<'a'>, 'as' | 'color'> & {
  color?: 'primary' | 'muted';
  href: string;
};

export function LinkText({
  variant = 'body',
  color = 'primary',
  className = '',
  ...props
}: LinkTextProps) {
  return (
    <Text
      as="a"
      variant={variant}
      color={color}
      className={`hover:underline ${className}`}
      {...props}
    />
  );
}


LinkText.displayName = 'LinkText';

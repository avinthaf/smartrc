import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Color utilities
export const getColorValue = (colorPath: string): string => {
  return `var(--color-${colorPath})`;
};

// Spacing utilities
export const getSpacingValue = (size: keyof import('./index').Theme['spacing']): string => {
  return `var(--spacing-${size})`;
};

// Border radius utilities
export const getRadiusValue = (size: keyof import('./index').Theme['borderRadius']): string => {
  return `var(--radius-${size})`;
};

// Font size utilities
export const getFontSizeValue = (size: keyof import('./index').Theme['fontSize']): string => {
  return `var(--font-size-${size})`;
};

// Font weight utilities
export const getFontWeightValue = (weight: keyof import('./index').Theme['fontWeight']): string => {
  return `var(--font-weight-${weight})`;
};

// Line height utilities
export const getLineHeightValue = (height: keyof import('./index').Theme['lineHeight']): string => {
  return `var(--leading-${height})`;
};

// Box shadow utilities
export const getShadowValue = (shadow: keyof import('./index').Theme['boxShadow']): string => {
  return `var(--shadow-${shadow})`;
};

// Animation utilities
export const getAnimationValue = (animation: keyof import('./index').Theme['animation']): string => {
  return `var(--animate-${animation})`;
};

// Transition utilities
export const getDurationValue = (duration: keyof import('./index').Theme['transition']['duration']): string => {
  return `var(--duration-${duration})`;
};

export const getEaseValue = (ease: keyof import('./index').Theme['transition']['ease']): string => {
  return `var(--ease-${ease})`;
};

// Component style builders
export const buildButtonStyles = (variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning' | 'link', size: 'sm' | 'md' | 'lg' | 'xl') => {
  const variants = {
    default: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200 focus:ring-secondary-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
    ghost: 'hover:bg-secondary-100 text-secondary-700 focus:ring-primary-500',
    destructive: 'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500',
    success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500',
    warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500',
    link: 'text-primary-600 hover:underline underline-offset-4 focus:ring-primary-500',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    xl: 'h-14 px-8 text-lg',
  };

  return cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
    variants[variant],
    sizes[size]
  );
};

export const buildInputStyles = (hasError: boolean = false) => {
  return cn(
    'flex h-10 w-full rounded-md border bg-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    hasError ? 'border-error-500 focus:ring-error-500' : 'border-gray-300 focus:ring-primary-500'
  );
};

export const buildCardStyles = () => {
  return cn(
    'rounded-lg border bg-card text-card-foreground shadow-sm'
  );
};

export const buildAlertStyles = (variant: 'default' | 'destructive' | 'warning' | 'success' | 'info') => {
  const variants = {
    default: 'bg-background text-foreground border-gray-200',
    destructive: 'bg-error-50 text-error-800 border-error-200',
    warning: 'bg-warning-50 text-warning-800 border-warning-200',
    success: 'bg-success-50 text-success-800 border-success-200',
    info: 'bg-primary-50 text-primary-800 border-primary-200',
  };

  return cn(
    'relative w-full rounded-lg border p-4',
    variants[variant]
  );
};

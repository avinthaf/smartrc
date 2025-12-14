import React from 'react';
import { cn } from '../lib/utils';

export interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'gray' | 'muted' | 'foreground';
  weight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  align?: 'left' | 'center' | 'right' | 'justify';
  className?: string;
  children: React.ReactNode;
}

const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  color = 'foreground',
  weight,
  align = 'left',
  className,
  children,
}) => {
  const getVariantClasses = () => {
    const variants = {
      h1: `text-4xl font-bold leading-tight`,
      h2: `text-3xl font-bold leading-tight`,
      h3: `text-2xl font-semibold leading-tight`,
      h4: `text-xl font-semibold leading-tight`,
      h5: `text-lg font-medium leading-tight`,
      h6: `text-base font-medium leading-normal`,
      body1: `text-base font-normal leading-normal`,
      body2: `text-sm font-normal leading-normal`,
      caption: `text-xs font-normal leading-normal`,
      overline: `text-xs font-medium leading-normal uppercase tracking-wider`,
    };

    return variants[variant];
  };

  const getColorClasses = () => {
    const colors = {
      primary: 'text-primary-600',
      secondary: 'text-secondary-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      error: 'text-error-600',
      gray: 'text-gray-600',
      muted: 'text-muted-foreground',
      foreground: 'text-foreground',
    };

    return colors[color];
  };

  const getWeightClasses = () => {
    if (!weight) return '';
    const weights: Record<string, string> = {
      thin: 'font-thin',
      extralight: 'font-extralight',
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
      black: 'font-black',
    };

    return weights[weight];
  };

  const getAlignClasses = () => {
    const aligns = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    };

    return aligns[align];
  };

  const getComponent = (): keyof React.JSX.IntrinsicElements => {
    const headingVariants = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    if (headingVariants.includes(variant)) {
      return variant as keyof React.JSX.IntrinsicElements;
    }
    return 'p';
  };

  const Component = getComponent();

  const props = {
    className: cn(
      getVariantClasses(),
      getColorClasses(),
      getWeightClasses(),
      getAlignClasses(),
      className
    ),
  };

  if (Component === 'h1') {
    return <h1 {...props}>{children}</h1>;
  } else if (Component === 'h2') {
    return <h2 {...props}>{children}</h2>;
  } else if (Component === 'h3') {
    return <h3 {...props}>{children}</h3>;
  } else if (Component === 'h4') {
    return <h4 {...props}>{children}</h4>;
  } else if (Component === 'h5') {
    return <h5 {...props}>{children}</h5>;
  } else if (Component === 'h6') {
    return <h6 {...props}>{children}</h6>;
  } else {
    return <p {...props}>{children}</p>;
  }
};

export default Typography;
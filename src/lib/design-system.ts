// EventFlow Design System

// Color Palette
export const colors = {
  background: '#FFFFFF',
  foreground: '#1D1D1D',
  primary: '#6CDAEC',
  primaryAccent: '#5BCFE3',
  secondary: '#F5F5F5',
  muted: '#F0F0F0',
  accent: '#E8E8E8',
  card: '#FFFFFF',
  border: '#E5E5E5',
  input: '#F8F8F8',
  destructive: '#E74C3C'
}

// Typography
export const typography = {
  fontFamily: 'Inter, system-ui, sans-serif',
  heading1: 'text-4xl font-bold tracking-tight',
  heading2: 'text-3xl font-bold tracking-tight',
  heading3: 'text-2xl font-semibold',
  heading4: 'text-xl font-semibold',
  body: 'text-base',
  small: 'text-sm',
  tiny: 'text-xs'
}

// Spacing
export const spacing = {
  xs: '0.25rem', // 4px
  sm: '0.5rem',  // 8px
  md: '1rem',    // 16px
  lg: '1.5rem',  // 24px
  xl: '2rem',    // 32px
  xxl: '3rem'    // 48px
}

// Shadows
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow',
  lg: 'shadow-lg'
}

// Border Radius
export const borderRadius = {
  sm: 'rounded-sm',
  md: 'rounded',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full'
}

// Button Variants
export const buttonVariants = {
  primary: 'bg-[#6CDAEC] hover:bg-[#5BCFE3] text-white font-medium',
  secondary: 'bg-secondary hover:bg-accent text-foreground font-medium',
  outline: 'border border-border bg-background hover:bg-accent text-foreground font-medium',
  ghost: 'hover:bg-accent text-foreground font-medium',
  link: 'text-primary underline-offset-4 hover:underline',
  destructive: 'bg-[#E74C3C] hover:bg-[#C0392B] text-white font-medium'
}

// Card Variants
export const cardVariants = {
  default: 'bg-card border border-border rounded-lg overflow-hidden',
  event: 'bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200'
}

// Input Variants
export const inputVariants = {
  default: 'bg-input border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
}

// Design System
export const designSystem = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  buttonVariants,
  cardVariants,
  inputVariants
}

export default designSystem 
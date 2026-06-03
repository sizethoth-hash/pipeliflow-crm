import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }[size]

  return (
    <div
      role="status"
      aria-label="Carregando"
      className={cn(
        'animate-spin rounded-full border-2 border-slate-200 border-t-indigo-500',
        sizeClass,
        className
      )}
    />
  )
}

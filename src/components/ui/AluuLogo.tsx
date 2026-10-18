import { cn } from '@/lib/utils';

interface AluuLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const iconSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-2xl',
};

export function AluuLogo({ className, size = 'md', showText = false }: AluuLogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'relative rounded-xl bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center shadow-lg shadow-primary/25',
          sizeClasses[size]
        )}
      >
        {/* Letter A with chat bubble tail */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn('w-3/5 h-3/5', iconSizeClasses[size])}
        >
          {/* Main chat bubble shape */}
          <path
            d="M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2h-4l-4 4v-4H4a2 2 0 01-2-2V6a2 2 0 012-2z"
            fill="white"
            fillOpacity="0.15"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Letter A inside */}
          <path
            d="M12 7l-4 8m4-8l4 8m-6.5-3h5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showText && (
        <span className="font-semibold text-foreground">AluuAI</span>
      )}
    </div>
  );
}

import { useTheme } from '@/contexts/ThemeContext';
import { AluuLogo } from '@/components/ui/AluuLogo';

export function TypingIndicator() {
  const { t } = useTheme();

  return (
    <div className="flex gap-4 p-4 md:p-6 bg-muted/30">
      <AluuLogo size="sm" />
      <div className="flex-1">
        <div className="font-semibold text-sm mb-1">AluuAI</div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-sm">{t('chat.typing')}</span>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface MessageActionsProps {
  content: string;
  messageId: string;
  feedback?: 'like' | 'dislike';
  onRegenerate?: () => void;
  onFeedback?: (type: 'like' | 'dislike') => void;
}

export function MessageActions({
  content,
  messageId,
  feedback,
  onRegenerate,
  onFeedback,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useTheme();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            {t('actions.copied')}
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            {t('actions.copy')}
          </>
        )}
      </Button>

      {onRegenerate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {t('actions.regenerate')}
        </Button>
      )}

      {onFeedback && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback('like')}
            className={cn(
              "h-7 px-2 text-muted-foreground hover:text-foreground",
              feedback === 'like' && "text-emerald-500 hover:text-emerald-500"
            )}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFeedback('dislike')}
            className={cn(
              "h-7 px-2 text-muted-foreground hover:text-foreground",
              feedback === 'dislike' && "text-red-500 hover:text-red-500"
            )}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageActionsMinimalProps {
  content: string;
  messageId: string;
  feedback?: 'like' | 'dislike';
  onRegenerate?: () => void;
  onFeedback?: (type: 'like' | 'dislike') => void;
}

export function MessageActionsMinimal({
  content,
  feedback,
  onRegenerate,
  onFeedback,
}: MessageActionsMinimalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>

      {onFeedback && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFeedback('like')}
            className={cn(
              'h-7 w-7 hover:bg-muted',
              feedback === 'like'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFeedback('dislike')}
            className={cn(
              'h-7 w-7 hover:bg-muted',
              feedback === 'dislike'
                ? 'text-destructive'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </Button>
        </>
      )}

      {onRegenerate && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRegenerate}
          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}

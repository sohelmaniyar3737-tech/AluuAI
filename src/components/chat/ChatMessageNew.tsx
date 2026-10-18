import { cn } from '@/lib/utils';
import { Message, Attachment } from '@/types/database';
import { User } from 'lucide-react';
import { CodeBlock } from './CodeBlock';
import { MessageActions } from './MessageActions';
import { AttachmentDisplay } from './AttachmentDisplay';
import { AluuLogo } from '@/components/ui/AluuLogo';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  feedback?: 'like' | 'dislike';
  onRegenerate?: () => void;
  onFeedback?: (type: 'like' | 'dislike') => void;
  attachments?: Attachment[];
}

export function ChatMessageNew({
  message,
  isStreaming,
  feedback,
  onRegenerate,
  onFeedback,
  attachments = [],
}: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'group flex gap-4 p-4 md:p-6',
        isUser ? 'bg-transparent' : 'bg-muted/30'
      )}
    >
      {isUser ? (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <User className="w-5 h-5 text-primary-foreground" />
        </div>
      ) : (
        <AluuLogo size="sm" />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm mb-1">
          {isUser ? 'You' : 'AluuAI'}
        </div>

        {/* Show attachments for user messages */}
        {isUser && attachments.length > 0 && (
          <AttachmentDisplay attachments={attachments} className="mb-3" />
        )}

        <div className="text-foreground prose prose-invert prose-sm max-w-none">
          <MessageContent content={message.content} />
        </div>

        {!isUser && !isStreaming && (
          <MessageActions
            content={message.content}
            messageId={message.id}
            feedback={feedback}
            onRegenerate={onRegenerate}
            onFeedback={onFeedback}
          />
        )}
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const codeContent = part.slice(3, -3);
          const firstNewline = codeContent.indexOf('\n');
          const language = firstNewline > 0 ? codeContent.slice(0, firstNewline).trim() : '';
          const code = firstNewline > 0 ? codeContent.slice(firstNewline + 1) : codeContent;

          return <CodeBlock key={index} code={code} language={language} />;
        }

        // Regular text with inline code
        const inlineParts = part.split(/(`[^`]+`)/g);
        return (
          <p key={index} className="whitespace-pre-wrap leading-relaxed">
            {inlineParts.map((inlinePart, inlineIndex) => {
              if (inlinePart.startsWith('`') && inlinePart.endsWith('`')) {
                return (
                  <code
                    key={inlineIndex}
                    className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary"
                  >
                    {inlinePart.slice(1, -1)}
                  </code>
                );
              }
              return <span key={inlineIndex}>{inlinePart}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

import { cn } from '@/lib/utils';
import { Message, Attachment } from '@/types/database';
import { CodeBlock } from './CodeBlock';
import { MessageActionsMinimal } from './MessageActionsMinimal';
import { AttachmentDisplay } from './AttachmentDisplay';

interface ChatMessageMinimalProps {
  message: Message;
  isStreaming?: boolean;
  feedback?: 'like' | 'dislike';
  onRegenerate?: () => void;
  onFeedback?: (type: 'like' | 'dislike') => void;
  attachments?: Attachment[];
}

export function ChatMessageMinimal({
  message,
  isStreaming,
  feedback,
  onRegenerate,
  onFeedback,
  attachments = [],
}: ChatMessageMinimalProps) {
  const isUser = message.role === 'user';

  return (
    <div className="py-4 animate-fade-in">
      <div
        className={cn(
          'flex',
          isUser ? 'justify-end' : 'justify-start'
        )}
      >
        <div
          className={cn(
            'max-w-[85%] md:max-w-[75%]',
            isUser ? 'order-1' : 'order-0'
          )}
        >
          {/* Attachments for user messages */}
          {isUser && attachments.length > 0 && (
            <div className="mb-2 flex justify-end">
              <AttachmentDisplay attachments={attachments} />
            </div>
          )}

          {/* Message bubble */}
          <div
            className={cn(
              'rounded-2xl px-4 py-3',
              isUser
                ? 'bg-muted text-foreground'
                : 'bg-transparent text-foreground'
            )}
          >
            <MessageContent content={message.content} />
          </div>

          {/* Actions for assistant messages */}
          {!isUser && !isStreaming && (
            <MessageActionsMinimal
              content={message.content}
              messageId={message.id}
              feedback={feedback}
              onRegenerate={onRegenerate}
              onFeedback={onFeedback}
            />
          )}
        </div>
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
          <p key={index} className="whitespace-pre-wrap leading-relaxed text-[15px]">
            {inlineParts.map((inlinePart, inlineIndex) => {
              if (inlinePart.startsWith('`') && inlinePart.endsWith('`')) {
                return (
                  <code
                    key={inlineIndex}
                    className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
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

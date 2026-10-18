import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      'flex gap-4 p-4 md:p-6',
      isUser ? 'bg-transparent' : 'bg-muted/30'
    )}>
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center',
        isUser ? 'bg-primary' : 'bg-emerald-600'
      )}>
        {isUser ? (
          <User className="w-5 h-5 text-primary-foreground" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm mb-1">
          {isUser ? 'You' : 'AluuAI'}
        </div>
        <div className="text-foreground prose prose-invert prose-sm max-w-none">
          <MessageContent content={message.content} />
        </div>
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  // Simple markdown-like rendering for code blocks and formatting
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // Code block
          const codeContent = part.slice(3, -3);
          const firstNewline = codeContent.indexOf('\n');
          const language = firstNewline > 0 ? codeContent.slice(0, firstNewline).trim() : '';
          const code = firstNewline > 0 ? codeContent.slice(firstNewline + 1) : codeContent;

          return (
            <pre key={index} className="bg-muted/50 border border-border rounded-lg p-4 overflow-x-auto">
              {language && (
                <div className="text-xs text-muted-foreground mb-2">{language}</div>
              )}
              <code className="text-sm text-foreground">{code}</code>
            </pre>
          );
        }

        // Regular text with inline code
        const inlineParts = part.split(/(`[^`]+`)/g);
        return (
          <p key={index} className="whitespace-pre-wrap leading-relaxed">
            {inlineParts.map((inlinePart, inlineIndex) => {
              if (inlinePart.startsWith('`') && inlinePart.endsWith('`')) {
                return (
                  <code key={inlineIndex} className="bg-muted px-1.5 py-0.5 rounded text-sm">
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

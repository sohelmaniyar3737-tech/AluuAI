import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-4 p-4 md:p-6 bg-muted/30">
      <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center bg-emerald-600">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm mb-1">Assistant</div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}

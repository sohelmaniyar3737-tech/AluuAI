import { Code, Lightbulb, BookOpen, Zap, MessageSquare, Bot } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { AluuLogo } from '@/components/ui/AluuLogo';

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  {
    icon: Code,
    title: 'Write code',
    prompt: 'Write a Python function to calculate the Fibonacci sequence',
  },
  {
    icon: Lightbulb,
    title: 'Brainstorm ideas',
    prompt: 'Give me 5 creative startup ideas in the AI space',
  },
  {
    icon: BookOpen,
    title: 'Explain concepts',
    prompt: 'Explain quantum computing in simple terms',
  },
  {
    icon: Zap,
    title: 'Solve problems',
    prompt: 'How do I optimize a slow database query?',
  },
  {
    icon: MessageSquare,
    title: 'Draft content',
    prompt: 'Write a professional email to follow up on a job application',
  },
  {
    icon: Bot,
    title: 'Learn something',
    prompt: 'Teach me the basics of machine learning',
  },
];

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  const { t } = useTheme();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
      <AluuLogo size="xl" className="mb-6" />
      
      <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-center">
        {t('chat.emptyTitle')}
      </h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        {t('chat.emptySubtitle')}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.prompt)}
            className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border hover:border-primary/50 transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
              <suggestion.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm mb-1">{suggestion.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{suggestion.prompt}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

import { useTheme } from '@/contexts/ThemeContext';

interface EmptyStateMinimalProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  { label: 'Create image', prompt: 'Generate an image of a beautiful sunset over mountains' },
  { label: 'Summarize text', prompt: 'Summarize the following text for me:' },
  { label: 'Code', prompt: 'Write a function that sorts an array in JavaScript' },
  { label: 'Make a plan', prompt: 'Help me create a weekly workout plan' },
  { label: 'Explain', prompt: 'Explain how machine learning works in simple terms' },
];

export function EmptyStateMinimal({ onSuggestionClick }: EmptyStateMinimalProps) {
  const { t } = useTheme();

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      {/* Main heading */}
      <h1 className="text-2xl md:text-3xl font-medium text-foreground mb-8 text-center">
        What can I help with?
      </h1>

      {/* Pill-style action buttons */}
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.prompt)}
            className="px-4 py-2 text-sm font-medium text-muted-foreground bg-transparent border border-border rounded-full hover:bg-muted hover:text-foreground transition-colors"
          >
            {suggestion.label}
          </button>
        ))}
      </div>
    </div>
  );
}

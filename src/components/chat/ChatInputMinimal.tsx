import { useRef, FormEvent, useState, KeyboardEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, Plus } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { FilePreview } from './FilePreview';
import { FileUpload } from '@/types/database';

interface ChatInputMinimalProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  uploads: FileUpload[];
  isUploading: boolean;
  onAddFiles: (files: FileList | File[]) => void;
  onRemoveFile: (id: string) => void;
}

export function ChatInputMinimal({
  onSend,
  disabled,
  uploads,
  isUploading,
  onAddFiles,
  onRemoveFile,
}: ChatInputMinimalProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTheme();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if ((message.trim() || uploads.length > 0) && !disabled && !isUploading) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const canSend = (message.trim() || uploads.length > 0) && !disabled && !isUploading;

  return (
    <div className="p-4 pb-6">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="relative flex flex-col bg-muted/50 rounded-2xl border border-border focus-within:border-primary/40 transition-colors shadow-sm">
          {/* File previews */}
          <FilePreview
            uploads={uploads}
            onRemove={onRemoveFile}
            isUploading={isUploading}
          />

          <div className="flex items-end gap-1 p-2">
            {/* Attachment button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={handleAttachClick}
              disabled={disabled || isUploading}
            >
              <Plus className="h-5 w-5" />
            </Button>

            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder={t('chat.placeholder')}
              disabled={disabled || isUploading}
              className="flex-1 min-h-[40px] max-h-[160px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 py-2 px-2 text-[15px] placeholder:text-muted-foreground"
              rows={1}
            />

            <Button
              type="submit"
              size="icon"
              disabled={!canSend}
              className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:bg-muted transition-all"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,.docx"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />

        <p className="text-center text-xs text-muted-foreground mt-3">
          AluuAI can make mistakes. Consider checking important information.
        </p>
      </form>
    </div>
  );
}

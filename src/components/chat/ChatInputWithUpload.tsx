import { useRef, FormEvent, useState, KeyboardEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, Paperclip } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { FilePreview } from './FilePreview';
import { FileUpload } from '@/types/database';

interface ChatInputWithUploadProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  uploads: FileUpload[];
  isUploading: boolean;
  onAddFiles: (files: FileList | File[]) => void;
  onRemoveFile: (id: string) => void;
}

export function ChatInputWithUpload({
  onSend,
  disabled,
  uploads,
  isUploading,
  onAddFiles,
  onRemoveFile,
}: ChatInputWithUploadProps) {
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const canSend = (message.trim() || uploads.length > 0) && !disabled && !isUploading;

  return (
    <div className="border-t border-border bg-background p-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="relative flex flex-col bg-muted/50 rounded-2xl border border-border focus-within:border-primary/50 transition-colors">
          {/* File previews */}
          <FilePreview
            uploads={uploads}
            onRemove={onRemoveFile}
            isUploading={isUploading}
          />

          <div className="flex items-end">
            {/* Attachment button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 ml-1 mb-1 text-muted-foreground hover:text-foreground"
              onClick={handleAttachClick}
              disabled={disabled || isUploading}
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              placeholder={t('chat.placeholder')}
              disabled={disabled || isUploading}
              className="flex-1 min-h-[52px] max-h-[200px] resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 py-4 px-2 pr-14"
              rows={1}
            />

            <Button
              type="submit"
              size="icon"
              disabled={!canSend}
              className="absolute right-2 bottom-2 h-9 w-9 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              <ArrowUp className="h-5 w-5" />
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

        <p className="text-center text-xs text-muted-foreground mt-2">
          AluuAI can make mistakes. Consider checking important information.
        </p>
      </form>
    </div>
  );
}

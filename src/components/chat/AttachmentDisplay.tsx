import { Download, File, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Attachment } from '@/types/database';
import { cn } from '@/lib/utils';

interface AttachmentDisplayProps {
  attachments: Attachment[];
  className?: string;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentDisplay({ attachments, className }: AttachmentDisplayProps) {
  if (attachments.length === 0) return null;

  const images = attachments.filter(a => a.file_type === 'image');
  const documents = attachments.filter(a => a.file_type === 'document');

  return (
    <div className={cn('space-y-3', className)}>
      {/* Image grid */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((attachment) => (
            <a
              key={attachment.id}
              href={attachment.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group"
            >
              <img
                src={attachment.file_url}
                alt={attachment.file_name}
                className="max-w-xs max-h-64 rounded-lg object-cover border border-border hover:border-primary transition-colors"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-white" />
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Document cards */}
      {documents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {documents.map((attachment) => (
            <a
              key={attachment.id}
              href={attachment.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors max-w-[250px]"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <File className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.file_size)}
                </p>
              </div>
              <Download className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

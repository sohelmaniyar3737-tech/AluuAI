import { X, File, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/types/database';
import { cn } from '@/lib/utils';

interface FilePreviewProps {
  uploads: FileUpload[];
  onRemove: (id: string) => void;
  isUploading?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilePreview({ uploads, onRemove, isUploading }: FilePreviewProps) {
  if (uploads.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-3 border-b border-border">
      {uploads.map((upload) => {
        const isImage = upload.file.type.startsWith('image/');

        return (
          <div
            key={upload.id}
            className={cn(
              'relative group flex items-center gap-2 bg-muted rounded-lg p-2 pr-8',
              isImage ? 'w-24 h-24' : 'max-w-[200px]'
            )}
          >
            {isImage && upload.preview ? (
              <img
                src={upload.preview}
                alt={upload.file.name}
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <>
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {isImage ? (
                    <ImageIcon className="w-5 h-5 text-primary" />
                  ) : (
                    <File className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{upload.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(upload.file.size)}
                  </p>
                </div>
              </>
            )}

            {/* Progress overlay */}
            {isUploading && upload.progress < 100 && (
              <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {/* Remove button */}
            {!isUploading && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground',
                  'opacity-0 group-hover:opacity-100 transition-opacity'
                )}
                onClick={() => onRemove(upload.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

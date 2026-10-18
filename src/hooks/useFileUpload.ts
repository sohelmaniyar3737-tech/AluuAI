import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { FileUpload, Attachment } from '@/types/database';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'application/pdf': 'document',
  'text/plain': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
};

export function useFileUpload() {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds 10MB limit`;
    }
    if (!Object.keys(ALLOWED_TYPES).includes(file.type)) {
      return `File type "${file.type}" is not supported. Allowed: jpg, png, webp, pdf, txt, docx`;
    }
    return null;
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newUploads: FileUpload[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: 'File Error',
          description: error,
          variant: 'destructive',
        });
        continue;
      }

      const isImage = file.type.startsWith('image/');
      const preview = isImage ? URL.createObjectURL(file) : null;

      newUploads.push({
        file,
        preview,
        progress: 0,
        id: crypto.randomUUID(),
      });
    }

    setUploads(prev => [...prev, ...newUploads]);
  }, [validateFile]);

  const removeFile = useCallback((id: string) => {
    setUploads(prev => {
      const upload = prev.find(u => u.id === id);
      if (upload?.preview) {
        URL.revokeObjectURL(upload.preview);
      }
      return prev.filter(u => u.id !== id);
    });
  }, []);

  const clearFiles = useCallback(() => {
    uploads.forEach(upload => {
      if (upload.preview) {
        URL.revokeObjectURL(upload.preview);
      }
    });
    setUploads([]);
  }, [uploads]);

  const uploadFiles = useCallback(async (chatId: string): Promise<Attachment[]> => {
    if (!user || uploads.length === 0) return [];

    setIsUploading(true);
    const attachments: Attachment[] = [];

    try {
      for (const upload of uploads) {
        const form = new FormData(); form.append('file', upload.file); form.append('chatId', chatId);
        let attachmentData: Attachment;
        try { attachmentData = await api<Attachment>('/uploads', { method: 'POST', body: form }); }
        catch (error) { toast({ title: 'Upload Failed', description: error instanceof Error ? error.message : `Failed to upload ${upload.file.name}`, variant: 'destructive' }); continue; }

        // Update progress
        setUploads(prev =>
          prev.map(u => (u.id === upload.id ? { ...u, progress: 100 } : u))
        );

        attachments.push(attachmentData as Attachment);
      }

      return attachments;
    } finally {
      setIsUploading(false);
    }
  }, [user, uploads]);

  const getFileContent = useCallback(async (attachment: Attachment): Promise<string | null> => {
    if (attachment.file_type === 'image') {
      return null; // Images are handled via vision API
    }

    try {
      const response = await fetch(attachment.file_url);
      if (!response.ok) return null;

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/plain')) {
        return await response.text();
      }

      // For PDF and DOCX, we'd need server-side parsing
      // For now, indicate that the file was attached
      return `[Document attached: ${attachment.file_name}]`;
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  }, []);

  return {
    uploads,
    isUploading,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    getFileContent,
  };
}

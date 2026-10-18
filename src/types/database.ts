export interface Chat {
  id: string;
  user_id: string;
  title: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Feedback {
  id: string;
  message_id: string;
  user_id: string;
  type: 'like' | 'dislike';
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: 'light' | 'dark';
  language: 'en' | 'hi';
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  user_id: string;
  chat_id: string | null;
  message_id: string | null;
  file_url: string;
  file_type: string;
  file_name: string;
  file_size: number | null;
  created_at: string;
}

export interface FileUpload {
  file: File;
  preview: string | null;
  progress: number;
  id: string;
}

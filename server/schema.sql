CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL DEFAULT '', email TEXT NOT NULL UNIQUE,
 password_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS chats (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 title TEXT NOT NULL DEFAULT 'New Chat', is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS chats_user_updated_idx ON chats(user_id, is_pinned DESC, updated_at DESC);
CREATE TABLE IF NOT EXISTS messages (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 role TEXT NOT NULL CHECK (role IN ('user','assistant')), content TEXT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS messages_chat_created_idx ON messages(chat_id, created_at);
CREATE TABLE IF NOT EXISTS feedback (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
 user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, type TEXT NOT NULL CHECK(type IN ('like','dislike')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE(message_id,user_id)
);
CREATE TABLE IF NOT EXISTS user_preferences (
 user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, theme TEXT NOT NULL DEFAULT 'light' CHECK(theme IN ('light','dark')),
 language TEXT NOT NULL DEFAULT 'en' CHECK(language IN ('en','hi')), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS attachments (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 chat_id UUID REFERENCES chats(id) ON DELETE CASCADE, message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
 file_url TEXT NOT NULL, file_type TEXT NOT NULL, file_name TEXT NOT NULL, file_size BIGINT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

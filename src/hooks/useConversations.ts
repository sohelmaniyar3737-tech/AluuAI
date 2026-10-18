import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message } from '@/types/chat';

const STORAGE_KEY = 'aluuai-conversations';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateTitle(firstMessage: string): string {
  const maxLength = 30;
  const cleaned = firstMessage.replace(/\n/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength) + '...';
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Conversation[];
        setConversations(parsed);
        // Set the most recent conversation as active if available
        if (parsed.length > 0) {
          setActiveConversationId(parsed[0].id);
        }
      } catch (e) {
        console.error('Failed to parse stored conversations:', e);
      }
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  const createNewConversation = useCallback((): string => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation.id;
  }, []);

  const addMessage = useCallback((conversationId: string, message: Message) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id !== conversationId) return conv;

      const updatedMessages = [...conv.messages, message];
      const title = conv.messages.length === 0 && message.role === 'user'
        ? generateTitle(message.content)
        : conv.title;

      return {
        ...conv,
        messages: updatedMessages,
        title,
        updatedAt: Date.now(),
      };
    }));
  }, []);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== conversationId);
      
      // If we deleted the active conversation, switch to another
      if (activeConversationId === conversationId) {
        setActiveConversationId(filtered.length > 0 ? filtered[0].id : null);
      }
      
      return filtered;
    });
  }, [activeConversationId]);

  const selectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
  }, []);

  return {
    conversations,
    activeConversation,
    activeConversationId,
    createNewConversation,
    addMessage,
    deleteConversation,
    selectConversation,
  };
}

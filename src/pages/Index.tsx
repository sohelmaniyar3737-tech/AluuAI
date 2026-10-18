import { useState, useCallback } from 'react';
import { useChat } from '@/hooks/useChat';
import { useConversations } from '@/hooks/useConversations';
import { Message } from '@/types/chat';
import { ChatSidebar } from '@/components/sidebar/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatInput } from '@/components/chat/ChatInput';
import { ErrorBanner } from '@/components/chat/ErrorBanner';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);

  const { sendMessage, isLoading, error, clearError } = useChat();
  const {
    conversations,
    activeConversation,
    activeConversationId,
    createNewConversation,
    addMessage,
    deleteConversation,
    selectConversation,
  } = useConversations();

  const handleSend = useCallback(async (message: string) => {
    let conversationId = activeConversationId;
    
    // Create new conversation if none exists
    if (!conversationId) {
      conversationId = createNewConversation();
    }

    setLastUserMessage(message);

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
    };
    addMessage(conversationId, userMessage);

    // Get current messages for context
    const currentMessages = activeConversation?.messages || [];

    // Send to API and get response
    const reply = await sendMessage(message, currentMessages);

    if (reply) {
      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };
      addMessage(conversationId, assistantMessage);
    }
  }, [activeConversationId, activeConversation, createNewConversation, addMessage, sendMessage]);

  const handleRetry = useCallback(() => {
    if (lastUserMessage) {
      clearError();
      // Remove the last user message and retry
      handleSend(lastUserMessage);
    }
  }, [lastUserMessage, clearError, handleSend]);

  const handleNewChat = useCallback(() => {
    createNewConversation();
    setSidebarOpen(false);
  }, [createNewConversation]);

  return (
    <div className="h-screen flex bg-background text-foreground">
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <ChatHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <ChatWindow
          messages={activeConversation?.messages || []}
          isLoading={isLoading}
        />

        {error && (
          <ErrorBanner
            message={error}
            onDismiss={clearError}
            onRetry={handleRetry}
          />
        )}

        <ChatInput onSend={handleSend} disabled={isLoading} />
      </main>
    </div>
  );
}

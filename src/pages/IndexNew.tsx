import { useState, useCallback, useEffect, useRef } from 'react';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { useChats } from '@/hooks/useChats';
import { useFeedback } from '@/hooks/useFeedback';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAttachments } from '@/hooks/useAttachments';
import { ChatSidebarMinimal } from '@/components/sidebar/ChatSidebarMinimal';
import { ChatHeaderMinimal } from '@/components/chat/ChatHeaderMinimal';
import { ChatMessageMinimal } from '@/components/chat/ChatMessageMinimal';
import { ChatInputMinimal } from '@/components/chat/ChatInputMinimal';
import { TypingIndicatorMinimal } from '@/components/chat/TypingIndicatorMinimal';
import { EmptyStateMinimal } from '@/components/chat/EmptyStateMinimal';
import { ErrorBanner } from '@/components/chat/ErrorBanner';
import { Message, Attachment } from '@/types/database';

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);

  const { sendMessage, isLoading, error, clearError } = useStreamingChat();
  const {
    chats,
    activeChat,
    messages,
    searchQuery,
    setSearchQuery,
    isNewChatMode,
    startNewChat,
    createChat,
    renameChat,
    deleteChat,
    clearChat,
    togglePinChat,
    addMessage,
    updateMessage,
    selectChat,
  } = useChats();
  const { getFeedback, setFeedback } = useFeedback();
  const {
    uploads,
    isUploading,
    addFiles,
    removeFile,
    clearFiles,
    uploadFiles,
    getFileContent,
  } = useFileUpload();
  const { getAttachmentsForMessage, addAttachments } = useAttachments(activeChat?.id || null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage, isLoading]);

  const handleSend = useCallback(async (messageContent: string) => {
    let chatId = activeChat?.id;

    // Create new chat if none exists
    if (!chatId) {
      const newChat = await createChat();
      if (!newChat) return;
      chatId = newChat.id;
    }

    // Upload files if any
    let uploadedAttachments: Attachment[] = [];
    if (uploads.length > 0) {
      uploadedAttachments = await uploadFiles(chatId);
      clearFiles();
    }

    // Add user message
    const userMessage = await addMessage(chatId, 'user', messageContent);
    
    // Link attachments to the message
    if (userMessage && uploadedAttachments.length > 0) {
      addAttachments(userMessage.id, uploadedAttachments);
    }

    // Create placeholder for streaming
    const tempId = 'streaming-' + Date.now();
    setStreamingMessage({
      id: tempId,
      chat_id: chatId,
      user_id: '',
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    });

    // Get conversation history
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: messageContent });

    // Get document content for context
    let documentContent = '';
    for (const attachment of uploadedAttachments) {
      if (attachment.file_type === 'document') {
        const content = await getFileContent(attachment);
        if (content) {
          documentContent += `\n\n--- ${attachment.file_name} ---\n${content}`;
        }
      }
    }

    // Send and stream response with attachments context
    const reply = await sendMessage(
      messageContent,
      history,
      (chunk) => {
        setStreamingMessage(prev => prev ? { ...prev, content: chunk } : null);
      },
      uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
      documentContent || undefined
    );

    setStreamingMessage(null);

    if (reply) {
      await addMessage(chatId, 'assistant', reply);
    }
  }, [activeChat, messages, uploads, createChat, addMessage, sendMessage, uploadFiles, clearFiles, getFileContent, addAttachments]);

  const handleRegenerate = useCallback(async () => {
    if (messages.length < 2) return;

    // Find last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return;

    // Get history up to but not including the last assistant message
    const lastAssistantIndex = messages.findIndex(
      m => m.role === 'assistant' && m === messages[messages.length - 1]
    );
    const history = messages
      .slice(0, lastAssistantIndex)
      .map(m => ({ role: m.role, content: m.content }));

    // Create streaming placeholder
    const tempId = 'streaming-' + Date.now();
    setStreamingMessage({
      id: tempId,
      chat_id: activeChat?.id || '',
      user_id: '',
      role: 'assistant',
      content: '',
      created_at: new Date().toISOString(),
    });

    const reply = await sendMessage(lastUserMessage.content, history, (chunk) => {
      setStreamingMessage(prev => prev ? { ...prev, content: chunk } : null);
    });

    setStreamingMessage(null);

    if (reply && activeChat) {
      // Update the last message instead of adding new one
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        updateMessage(lastMessage.id, reply);
      } else {
        await addMessage(activeChat.id, 'assistant', reply);
      }
    }
  }, [activeChat, messages, sendMessage, updateMessage, addMessage]);

  const handleNewChat = useCallback(() => {
    startNewChat();
    clearFiles();
    setSidebarOpen(false);
  }, [startNewChat, clearFiles]);

  const handleRetry = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      clearError();
      handleSend(lastUserMessage.content);
    }
  }, [messages, clearError, handleSend]);

  const displayMessages = streamingMessage
    ? [...messages.filter(m => m.id !== streamingMessage.id), streamingMessage]
    : messages;

  return (
    <div className="h-screen flex bg-background">
      <ChatSidebarMinimal
        chats={chats}
        activeChat={activeChat}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewChat={handleNewChat}
        onSelectChat={selectChat}
        onRenameChat={renameChat}
        onDeleteChat={deleteChat}
        onPinChat={togglePinChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isNewChatMode={isNewChatMode}
      />

      <main className="flex-1 flex flex-col min-w-0 relative">
        <ChatHeaderMinimal
          onMenuClick={() => setSidebarOpen(true)}
          chatTitle={activeChat?.title}
        />

        {messages.length === 0 && !isLoading && !streamingMessage ? (
          <EmptyStateMinimal onSuggestionClick={handleSend} />
        ) : (
          <div className="flex-1 overflow-y-auto px-4">
            <div className="max-w-3xl mx-auto">
              {displayMessages.map((message, index) => {
                const isLastAssistant =
                  message.role === 'assistant' &&
                  index === displayMessages.length - 1 &&
                  !streamingMessage;

                return (
                  <div key={message.id} className="group">
                    <ChatMessageMinimal
                      message={message}
                      isStreaming={message.id === streamingMessage?.id}
                      feedback={getFeedback(message.id)}
                      onRegenerate={isLastAssistant ? handleRegenerate : undefined}
                      onFeedback={(type) => setFeedback(message.id, type)}
                      attachments={getAttachmentsForMessage(message.id)}
                    />
                  </div>
                );
              })}
              {isLoading && !streamingMessage && <TypingIndicatorMinimal />}
              <div ref={bottomRef} className="h-4" />
            </div>
          </div>
        )}

        {error && (
          <ErrorBanner
            message={error}
            onDismiss={clearError}
            onRetry={handleRetry}
          />
        )}

        <ChatInputMinimal
          onSend={handleSend}
          disabled={isLoading}
          uploads={uploads}
          isUploading={isUploading}
          onAddFiles={addFiles}
          onRemoveFile={removeFile}
        />
      </main>
    </div>
  );
}

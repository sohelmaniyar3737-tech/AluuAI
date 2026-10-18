import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Chat } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  MessageSquare,
  Trash2,
  X,
  Search,
  Pencil,
  Check,
  Settings,
  Pin,
  PinOff,
  MoreVertical,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChatSidebarNewProps {
  chats: Chat[];
  activeChat: Chat | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewChat: () => void;
  onSelectChat: (chat: Chat) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onDeleteChat: (chatId: string) => void;
  onPinChat?: (chatId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isNewChatMode?: boolean;
}

export function ChatSidebarNew({
  chats,
  activeChat,
  searchQuery,
  onSearchChange,
  onNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
  onPinChat,
  isOpen,
  onClose,
  isNewChatMode,
}: ChatSidebarNewProps) {
  const { t } = useTheme();
  const navigate = useNavigate();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Separate pinned and unpinned chats
  const pinnedChats = chats.filter((chat) => chat.is_pinned);
  const unpinnedChats = chats.filter((chat) => !chat.is_pinned);

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteChat(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="p-3 border-b border-sidebar-border flex items-center gap-2">
          <Button
            onClick={onNewChat}
            variant="outline"
            className={cn(
              'flex-1 justify-start gap-2 bg-transparent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              isNewChatMode && 'bg-sidebar-accent text-sidebar-accent-foreground'
            )}
          >
            <Plus className="h-4 w-4" />
            {t('chat.newChat')}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-sidebar-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sidebar-foreground/60" />
            <Input
              placeholder={t('chat.searchChats')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/50"
            />
          </div>
        </div>

        {/* Chat list */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {chats.length === 0 ? (
              <div className="text-center py-8 text-sidebar-foreground/60 text-sm">
                {t('chat.noChats')}
              </div>
            ) : (
              <>
                {/* Pinned Section */}
                {pinnedChats.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-sidebar-foreground/60 px-3 py-1 uppercase">
                      Pinned
                    </p>
                    {pinnedChats.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === activeChat?.id && !isNewChatMode}
                        onSelect={() => {
                          onSelectChat(chat);
                          onClose();
                        }}
                        onRename={(newTitle) => onRenameChat(chat.id, newTitle)}
                        onDelete={() => setDeleteConfirmId(chat.id)}
                        onPin={onPinChat ? () => onPinChat(chat.id) : undefined}
                      />
                    ))}
                  </div>
                )}

                {/* Recent Section */}
                {unpinnedChats.length > 0 && (
                  <div>
                    {pinnedChats.length > 0 && (
                      <p className="text-xs font-medium text-sidebar-foreground/60 px-3 py-1 uppercase">
                        Recent
                      </p>
                    )}
                    {unpinnedChats.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === activeChat?.id && !isNewChatMode}
                        onSelect={() => {
                          onSelectChat(chat);
                          onClose();
                        }}
                        onRename={(newTitle) => onRenameChat(chat.id, newTitle)}
                        onDelete={() => setDeleteConfirmId(chat.id)}
                        onPin={onPinChat ? () => onPinChat(chat.id) : undefined}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Settings button */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => {
              navigate('/settings');
              onClose();
            }}
          >
            <Settings className="h-4 w-4" />
            {t('settings.title')}
          </Button>
        </div>
      </aside>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
  onPin?: () => void;
}

function ChatItem({
  chat,
  isActive,
  onSelect,
  onRename,
  onDelete,
  onPin,
}: ChatItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);

  const handleSave = () => {
    if (editTitle.trim()) {
      onRename(editTitle.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors',
        isActive 
          ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
          : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
      )}
      onClick={() => !isEditing && onSelect()}
    >
      <MessageSquare className={cn(
        'h-4 w-4 flex-shrink-0',
        isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground/60'
      )} />
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="h-6 text-sm p-1 bg-sidebar-accent text-sidebar-foreground"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              className="h-6 w-6 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <Check className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1">
              {chat.is_pinned && (
                <Pin className="h-3 w-3 text-primary flex-shrink-0" />
              )}
              <p className={cn(
                'text-sm truncate',
                isActive ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground'
              )}>{chat.title}</p>
            </div>
            <p className={cn(
              'text-xs',
              isActive ? 'text-sidebar-accent-foreground/70' : 'text-sidebar-foreground/60'
            )}>
              {formatDistanceToNow(new Date(chat.updated_at), {
                addSuffix: true,
              })}
            </p>
          </>
        )}
      </div>
      {!isEditing && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            {onPin && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onPin();
                }}
              >
                {chat.is_pinned ? (
                  <>
                    <PinOff className="h-4 w-4 mr-2" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="h-4 w-4 mr-2" />
                    Pin
                  </>
                )}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setEditTitle(chat.title);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Chat } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  X,
  Search,
  Pencil,
  Check,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useTheme } from '@/contexts/ThemeContext';
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

interface ChatSidebarMinimalProps {
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

export function ChatSidebarMinimal({
  chats,
  activeChat,
  searchQuery,
  onSearchChange,
  onNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
  isOpen,
  onClose,
  isNewChatMode,
}: ChatSidebarMinimalProps) {
  const { t } = useTheme();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transition-transform duration-200 md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="p-3 flex items-center justify-between">
          <Button
            onClick={onNewChat}
            variant="ghost"
            className={cn(
              'flex-1 justify-start gap-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent',
              isNewChatMode && 'bg-sidebar-accent'
            )}
          >
            <Plus className="h-4 w-4" />
            {t('chat.newChat')}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={t('chat.searchChats')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-8 text-sm bg-sidebar-accent/50 border-0 text-sidebar-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Chat list */}
        <ScrollArea className="flex-1">
          <div className="px-2 pb-2">
            {chats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                {t('chat.noChats')}
              </div>
            ) : (
              <div className="space-y-0.5">
                {chats.map((chat) => (
                  <ChatItemMinimal
                    key={chat.id}
                    chat={chat}
                    isActive={chat.id === activeChat?.id && !isNewChatMode}
                    onSelect={() => {
                      onSelectChat(chat);
                      onClose();
                    }}
                    onRename={(newTitle) => onRenameChat(chat.id, newTitle)}
                    onDelete={() => setDeleteConfirmId(chat.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
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
              Are you sure you want to delete this chat? This action cannot be undone.
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

interface ChatItemMinimalProps {
  chat: Chat;
  isActive: boolean;
  onSelect: () => void;
  onRename: (newTitle: string) => void;
  onDelete: () => void;
}

function ChatItemMinimal({
  chat,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: ChatItemMinimalProps) {
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
        'group flex items-center gap-2 rounded-lg px-2 py-2 cursor-pointer transition-colors text-sm',
        isActive
          ? 'bg-sidebar-accent text-sidebar-foreground'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50'
      )}
      onClick={() => !isEditing && onSelect()}
    >
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
              className="h-6 text-sm p-1 bg-background text-foreground"
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
              className="h-6 w-6"
            >
              <Check className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            <p className="truncate">{chat.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })}
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
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 bg-popover border-border">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setEditTitle(chat.title);
              }}
            >
              <Pencil className="h-3.5 w-3.5 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

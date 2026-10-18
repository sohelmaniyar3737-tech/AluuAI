import { Button } from '@/components/ui/button';
import { Menu, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChatHeaderMinimalProps {
  onMenuClick: () => void;
  chatTitle?: string;
}

export function ChatHeaderMinimal({ onMenuClick, chatTitle }: ChatHeaderMinimalProps) {
  const navigate = useNavigate();

  return (
    <header className="h-12 flex items-center justify-between px-3 bg-background/80 backdrop-blur-sm">
      {/* Left: Hamburger menu */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-transparent"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Center: Title - always visible */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <span className="font-medium text-sm text-foreground">
          {chatTitle || 'AluuAI'}
        </span>
      </div>

      {/* Right: Profile/Settings */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/settings')}
        className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-transparent"
      >
        <User className="h-5 w-5" />
      </Button>
    </header>
  );
}

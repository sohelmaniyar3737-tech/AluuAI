import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useChats } from '@/hooks/useChats';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Moon, Sun, Globe, Trash2, LogOut } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Settings() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme, setTheme, language, setLanguage, t } = useTheme();
  const { clearAllChats } = useChats();

  const handleClearChats = async () => {
    await clearAllChats();
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">{t('settings.title')}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Theme */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium flex items-center gap-2">
            {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            {t('settings.theme')}
          </h2>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-3">
              <Sun className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="theme-toggle">{t('settings.light')}</Label>
            </div>
            <Switch
              id="theme-toggle"
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
            <div className="flex items-center gap-3">
              <Label htmlFor="theme-toggle">{t('settings.dark')}</Label>
              <Moon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Language */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('settings.language')}
          </h2>
          <div className="flex gap-3">
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              onClick={() => setLanguage('en')}
            >
              English
            </Button>
            <Button
              variant={language === 'hi' ? 'default' : 'outline'}
              onClick={() => setLanguage('hi')}
            >
              हिंदी
            </Button>
          </div>
        </div>

        {/* Clear Chats */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            {t('settings.clearChats')}
          </h2>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="h-4 w-4 mr-2" />
                {t('settings.clearChats')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all chats?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All your chat history will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleClearChats}
                >
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Logout */}
        <div className="pt-6 border-t border-border">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t('settings.logout')}
          </Button>
        </div>
      </main>
    </div>
  );
}

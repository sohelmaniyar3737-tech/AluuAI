import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

type Theme = 'light' | 'dark';
type Language = 'en' | 'hi';

interface ThemeContextType {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.title': 'AluuAI',
    'chat.placeholder': 'Message AluuAI...',
    'chat.send': 'Send',
    'chat.newChat': 'New Chat',
    'chat.searchChats': 'Search chats...',
    'chat.noChats': 'No conversations yet',
    'chat.typing': 'AluuAI is typing...',
    'chat.emptyTitle': 'How can I help you today?',
    'chat.emptySubtitle': 'Start a conversation by typing a message below or try one of these suggestions.',
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.clearChats': 'Clear all chats',
    'settings.logout': 'Logout',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot password?',
    'auth.resetPassword': 'Reset Password',
    'auth.backToLogin': 'Back to login',
    'auth.sendResetLink': 'Send reset link',
    'auth.googleLogin': 'Continue with Google',
    'actions.copy': 'Copy',
    'actions.copied': 'Copied!',
    'actions.regenerate': 'Regenerate',
    'actions.like': 'Like',
    'actions.dislike': 'Dislike',
    'actions.rename': 'Rename',
    'actions.delete': 'Delete',
  },
  hi: {
    'app.title': 'AluuAI',
    'chat.placeholder': 'AluuAI को संदेश भेजें...',
    'chat.send': 'भेजें',
    'chat.newChat': 'नई चैट',
    'chat.searchChats': 'चैट खोजें...',
    'chat.noChats': 'अभी तक कोई बातचीत नहीं',
    'chat.typing': 'AluuAI टाइप कर रहा है...',
    'chat.emptyTitle': 'आज मैं आपकी कैसे मदद कर सकता हूं?',
    'chat.emptySubtitle': 'नीचे संदेश टाइप करके बातचीत शुरू करें या इन सुझावों में से एक आज़माएं।',
    'settings.title': 'सेटिंग्स',
    'settings.theme': 'थीम',
    'settings.language': 'भाषा',
    'settings.clearChats': 'सभी चैट साफ़ करें',
    'settings.logout': 'लॉगआउट',
    'settings.light': 'लाइट',
    'settings.dark': 'डार्क',
    'auth.login': 'लॉगिन',
    'auth.signup': 'साइन अप',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.forgotPassword': 'पासवर्ड भूल गए?',
    'auth.resetPassword': 'पासवर्ड रीसेट करें',
    'auth.backToLogin': 'लॉगिन पर वापस जाएं',
    'auth.sendResetLink': 'रीसेट लिंक भेजें',
    'auth.googleLogin': 'Google से जारी रखें',
    'actions.copy': 'कॉपी',
    'actions.copied': 'कॉपी हो गया!',
    'actions.regenerate': 'पुनः उत्पन्न करें',
    'actions.like': 'पसंद',
    'actions.dislike': 'नापसंद',
    'actions.rename': 'नाम बदलें',
    'actions.delete': 'हटाएं',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [language, setLanguageState] = useState<Language>('en');
  const { user } = useAuth();

  // Load preferences from database
  useEffect(() => {
    if (!user) return;

    const loadPreferences = async () => {
      try { const data = await api<{theme: Theme; language: Language}>('/preferences'); setThemeState(data.theme); setLanguageState(data.language); } catch (error) { console.error('Unable to load preferences', error); }
    };

    loadPreferences();
  }, [user]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    if (user) {
      await api('/preferences', { method: 'PUT', body: JSON.stringify({ theme: newTheme, language }) });
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    setLanguageState(newLanguage);
    if (user) {
      await api('/preferences', { method: 'PUT', body: JSON.stringify({ theme, language: newLanguage }) });
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <ThemeContext.Provider value={{ theme, language, setTheme, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

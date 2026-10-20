import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, LanguageInfo, SUPPORTED_LANGUAGES } from './types';
import { TRANSLATIONS } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  languages: LanguageInfo[];
}

const STORAGE_KEY = 'texttear_app_language_preference';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'vi' || saved === 'en' || saved === 'ko') {
        return saved;
      }
      // Check browser language
      const navLang = navigator.language.toLowerCase();
      if (navLang.startsWith('ko')) return 'ko';
      if (navLang.startsWith('en')) return 'en';
      return 'vi';
    } catch {
      return 'vi';
    }
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors
    }
    // Update html lang attribute
    document.documentElement.lang = lang;
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const currentDict = TRANSLATIONS[language];
      if (currentDict && key in currentDict) {
        return currentDict[key];
      }
      // Fallback to Vietnamese dictionary
      const viDict = TRANSLATIONS['vi'];
      if (viDict && key in viDict) {
        return viDict[key];
      }
      // Return provided fallback or key
      return fallback !== undefined ? fallback : key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Standalone translate helper function for utility functions outside React tree
export const translate = (key: string, lang: Language = 'vi', fallback?: string): string => {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['vi'];
  if (dict && key in dict) {
    return dict[key];
  }
  return fallback !== undefined ? fallback : key;
};

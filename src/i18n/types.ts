export type Language = 'vi' | 'en' | 'ko';

export interface LanguageInfo {
  code: Language;
  label: string;
  flag: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳', nativeName: 'Tiếng Việt' },
  { code: 'en', label: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'ko', label: '한국어', flag: '🇰🇷', nativeName: '한국어' },
];

export type TranslationKey = string;

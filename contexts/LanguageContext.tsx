'use client';
import React, { createContext, useContext, useState } from 'react';
import { en } from '@/lib/i18n/en';
import type { Translations } from '@/lib/i18n/en';
import { fr } from '@/lib/i18n/fr';

type Locale = 'en' | 'fr';

type LanguageContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType | null>(null);
export const useLanguage = () => useContext(LanguageContext)!;

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  const t = locale === 'en' ? en : fr;
  return <LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>;
}

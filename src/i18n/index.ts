import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';

export type AppLanguage = 'en' | 'hi';

const LANGUAGE_STORAGE_KEY = 'ganpati.language';

export const i18nReady = i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: { translation: en },
    hi: { translation: hi },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export async function restoreLanguagePreference(): Promise<AppLanguage> {
  await i18nReady;
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (savedLanguage === 'hi' || savedLanguage === 'en') {
    await i18n.changeLanguage(savedLanguage);
    return savedLanguage;
  }

  return 'en';
}

export async function setAppLanguage(language: AppLanguage): Promise<void> {
  await i18n.changeLanguage(language);
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

export default i18n;

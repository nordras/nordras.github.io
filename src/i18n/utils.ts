import { translations, type Language, type TranslationKey } from './translations';

export function useTranslations(lang: Language) {
  return function t(key: TranslationKey): string {
    return translations[lang]?.[key] || translations.pt[key] || key;
  };
}

export function getLangFromUrl(url: URL): Language {
  const [, lang] = url.pathname.split('/');
  if (lang in translations) return lang as Language;
  return 'pt';
}

export function getLocalizedUrl(url: string, targetLang: Language, currentLang: Language): string {
  // Remove o idioma atual da URL se existir
  let cleanUrl = url;
  if (currentLang !== 'pt') {
    cleanUrl = url.replace(`/${currentLang}`, '');
  }
  
  // Adiciona o novo idioma se não for português (padrão)
  if (targetLang === 'pt') {
    return cleanUrl;
  }
  
  return `/${targetLang}${cleanUrl}`;
}

export function getDateFormatter(lang: Language) {
  const locales = {
    pt: 'pt-BR',
    en: 'en-US'
  };
  
  return (date: Date) => date.toLocaleDateString(locales[lang], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
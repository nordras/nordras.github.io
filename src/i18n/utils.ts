import { translations, type Language, type TranslationKey } from './translations';

const postMapping: Record<string, Record<Language, string>> = {
  'using-mdx': {
    pt: 'using-mdx',
    en: 'using-mdx'
  },
  '0-react-components-elements-instances': {
    pt: '0-react-components-elements-instances',
    en: '0-react-components-elements-instances'
  }
};

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
  let cleanUrl = url;
  
  if (currentLang !== 'pt') {
    const langPrefix = `/${currentLang}`;
    if (cleanUrl.startsWith(langPrefix)) {
      cleanUrl = cleanUrl.substring(langPrefix.length) || '/';
    }
  }
  
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }
  
  const blogPostMatch = cleanUrl.match(/^\/blog\/([^\/]+)\/?$/);
  if (blogPostMatch) {
    const currentPostId = blogPostMatch[1];
    const mappedPostId = postMapping[currentPostId]?.[targetLang];
    
    if (mappedPostId && mappedPostId !== '') {
      if (targetLang === 'pt') {
        return `/blog/${mappedPostId}/`;
      } else {
        return `/${targetLang}/blog/${mappedPostId}/`;
      }
    } else {
      if (targetLang === 'pt') {
        return '/';
      } else {
        return `/${targetLang}/`;
      }
    }
  }
  
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
import { translations, type Language, type TranslationKey } from './translations';

// Mapeamento de posts entre idiomas
const postMapping: Record<string, Record<Language, string>> = {
  // React Hooks Guide
  'react-hooks-guide': {
    pt: 'react-hooks-guide',
    en: 'react-hooks-guide-en'
  },
  'react-hooks-guide-en': {
    pt: 'react-hooks-guide',
    en: 'react-hooks-guide-en'
  },
  // O que é React / What is React
  'o-que-e-react': {
    pt: 'o-que-e-react',
    en: 'what-is-react'
  },
  'what-is-react': {
    pt: 'o-que-e-react',
    en: 'what-is-react'
  },
  // React Hooks Internals
  'react-hooks-internals': {
    pt: 'react-hooks-internals',
    en: 'react-hooks-internals-en'
  },
  'react-hooks-internals-en': {
    pt: 'react-hooks-internals',
    en: 'react-hooks-internals-en'
  },
  // Posts sem tradução (redirecionam para home)
  'using-mdx': {
    pt: 'using-mdx',
    en: '' // Redireciona para home em inglês
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
  // Remove o idioma atual da URL se existir
  let cleanUrl = url;
  if (currentLang !== 'pt') {
    cleanUrl = url.replace(`/${currentLang}`, '');
  }
  
  // Para posts de blog, tentar encontrar o post correspondente no outro idioma
  const blogPostMatch = cleanUrl.match(/^\/blog\/([^\/]+)\/?$/);
  if (blogPostMatch) {
    const currentPostId = blogPostMatch[1];
    const mappedPostId = postMapping[currentPostId]?.[targetLang];
    
    if (mappedPostId && mappedPostId !== '') {
      // Post correspondente encontrado
      if (targetLang === 'pt') {
        return `/blog/${mappedPostId}/`;
      } else {
        return `/${targetLang}/blog/${mappedPostId}/`;
      }
    } else {
      // Post não existe no outro idioma, redirecionar para home
      if (targetLang === 'pt') {
        return '/';
      } else {
        return `/${targetLang}/`;
      }
    }
  }
  
  // Para outras páginas, aplicar a lógica normal
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
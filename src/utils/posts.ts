import { getCollection, type CollectionEntry } from 'astro:content';
import { POST_STATUS, type PostStatus, type Language, type BlogPost, type PublishedBlogPost } from '../types/blog';

/**
 * Filtra posts por status
 */
export function filterPostsByStatus<T extends PostStatus>(
	posts: BlogPost[],
	status: T
): BlogPost[] {
	return posts.filter(post => post.data.status === status);
}

/**
 * Filtra posts publicados por idioma
 */
export function getPublishedPostsByLanguage(
	posts: BlogPost[],
	language: Language
): BlogPost[] {
	return posts
		.filter(post => post.data.language === language)
		.filter(post => post.data.status === POST_STATUS.PUBLISHED)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Obtém todos os posts publicados
 */
export async function getPublishedPosts(): Promise<BlogPost[]> {
	const allPosts = await getCollection('blog');
	return filterPostsByStatus(allPosts, POST_STATUS.PUBLISHED);
}

/**
 * Obtém posts publicados por idioma (função helper)
 */
export async function getPublishedPostsForLanguage(language: Language): Promise<BlogPost[]> {
	const allPosts = await getCollection('blog');
	return getPublishedPostsByLanguage(allPosts, language);
}

/**
 * Obtém posts em draft (não publicados)
 */
export async function getDraftPosts(): Promise<BlogPost[]> {
	const allPosts = await getCollection('blog');
	return filterPostsByStatus(allPosts, POST_STATUS.UNPUBLISHED);
}

/**
 * Obtém posts em draft por idioma
 */
export async function getDraftPostsForLanguage(language: Language): Promise<BlogPost[]> {
	const allPosts = await getCollection('blog');
	return allPosts
		.filter(post => post.data.language === language)
		.filter(post => post.data.status === POST_STATUS.UNPUBLISHED)
		.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Verifica se um post está publicado
 */
export function isPostPublished(post: BlogPost): post is PublishedBlogPost {
	return post.data.status === POST_STATUS.PUBLISHED;
}

/**
 * Verifica se um post está em draft
 */
export function isPostDraft(post: BlogPost): boolean {
	return post.data.status === POST_STATUS.UNPUBLISHED;
}

/**
 * Obtém estatísticas dos posts
 */
export async function getPostsStatistics() {
	const allPosts = await getCollection('blog');
	
	const published = filterPostsByStatus(allPosts, POST_STATUS.PUBLISHED);
	const drafts = filterPostsByStatus(allPosts, POST_STATUS.UNPUBLISHED);
	
	const publishedPt = published.filter(p => p.data.language === 'pt');
	const publishedEn = published.filter(p => p.data.language === 'en');
	
	const draftsPt = drafts.filter(p => p.data.language === 'pt');
	const draftsEn = drafts.filter(p => p.data.language === 'en');
	
	return {
		total: allPosts.length,
		published: published.length,
		drafts: drafts.length,
		byLanguage: {
			pt: {
				published: publishedPt.length,
				drafts: draftsPt.length,
				total: publishedPt.length + draftsPt.length,
			},
			en: {
				published: publishedEn.length,
				drafts: draftsEn.length,
				total: publishedEn.length + draftsEn.length,
			},
		},
	};
}
import type { CollectionEntry } from 'astro:content';

// Post status types
export const POST_STATUS = {
	PUBLISHED: 'published',
	UNPUBLISHED: 'unpublished',
} as const;

export type PostStatus = typeof POST_STATUS[keyof typeof POST_STATUS];

// Language types
export const LANGUAGES = {
	PT: 'pt',
	EN: 'en',
} as const;

export type Language = typeof LANGUAGES[keyof typeof LANGUAGES];

// Blog post types
export type BlogPost = CollectionEntry<'blog'>;

export type PublishedBlogPost = BlogPost & {
	data: BlogPost['data'] & { 
		status: typeof POST_STATUS.PUBLISHED;
	};
};

export type UnpublishedBlogPost = BlogPost & {
	data: BlogPost['data'] & { 
		status: typeof POST_STATUS.UNPUBLISHED;
	};
};

// Helper type for filtering
export type BlogPostsByLanguage<T extends Language> = BlogPost & {
	data: BlogPost['data'] & { 
		language: T;
	};
};

// Post metadata type
export interface PostMetadata {
	id: string;
	title: string;
	description: string;
	pubDate: Date;
	updatedDate?: Date;
	language: Language;
	status: PostStatus;
	tags?: string[];
	heroImage?: ImageMetadata;
}

// Utility types for better type inference
export type PostsFilter<T extends PostStatus = PostStatus> = (post: BlogPost) => post is BlogPost & {
	data: BlogPost['data'] & { status: T };
};

export type LanguageFilter<T extends Language = Language> = (post: BlogPost) => post is BlogPost & {
	data: BlogPost['data'] & { language: T };
};
import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	const posts = await getCollection('blog');
	// RSS feed deve conter apenas posts publicados
	const publishedPosts = posts.filter(post => post.data.status === 'published');
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: publishedPosts.map((post) => ({
			...post.data,
			link: `/blog/${post.id}/`,
		})),
	});
}

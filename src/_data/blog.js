require('dotenv').config();

const {Client} = require('@notionhq/client');
const {NotionToMarkdown} = require('notion-to-md');
const {from} = require('rxjs');
const {mergeMap} = require('rxjs/operators');

module.exports = async () => {
	const notion = new Client({auth: process.env.NOTION_KEY});
	const n2m = new NotionToMarkdown({notionClient: notion});
	const databaseId = process.env.NOTION_BLOG_ID;

	const getContent = async id => {
		const mdBlocks = await n2m.pageToMarkdown(id);
		return n2m.toMarkdownString(mdBlocks);
	};

	const getYoutubeVideoId = url => {
		const urlObj = new URL(url);

		urlObj.search = '';
		urlObj.hash = '';

		const result = urlObj.toString();
		// console.log(result);
		return result.split('/').pop();
	};

	const getBlogData = () =>
		new Promise((resolve, reject) => {
			const postsData$ = async dbId => {
				const _db = await notion.databases.query({
					database_id: dbId,
					filter: {
						property: 'Publicar',
						checkbox: {equals: true}
					},
					sorts: [
						{
							timestamp: 'last_edited_time',
							direction: 'descending'
						}
					]
				});

				const _posts = _db.results.map(result => {
					// console.log(JSON.stringify(result, null, 2));
					return {
						id: result.id,
						title: result.properties['Título']?.title?.pop()
							.plain_text,
						content: undefined,
						cover:
							result.cover?.file?.url ||
							result.cover?.external?.url,
						// coverAlt: result.properties['Cover Alt']?.rich_text.pop()?.plain_text || '',
						presentation:
							result.properties['Apresentação']?.select?.name ||
							'',
						date:
							result.properties['Data']?.date?.start ||
							result.created_time,
						videoLink: getYoutubeVideoId(
							result.properties['Video link']?.url
						),
						summary:
							result.properties['Sumário']?.rich_text.pop()
								?.plain_text || ''
					};
				});

				for (i = 0; i < _posts.length; i++) {
					const _page = _posts[i];
					_posts[i].content = await getContent(_page.id);
				}

				return _posts;
			};

			from(
				notion.databases.query({
					database_id: databaseId,
					sorts: [
						{
							timestamp: 'last_edited_time',
							direction: 'descending'
						}
					]
				})
			)
				.pipe(
					mergeMap(response => response.results),
					mergeMap(postInfo => {
						const id =
							postInfo.properties['Table ID']?.rich_text?.pop()
								?.plain_text || '';
						return postsData$(id);
					})
				)
				.subscribe(posts => resolve(posts));
		});

	const content = await getBlogData();

	return {posts: content, latestPosts: content.slice(0, 4)};
};

require('dotenv').config();

const {Client} = require('@notionhq/client');
const {NotionToMarkdown} = require('notion-to-md');

module.exports = async () => {
	const notion = new Client({auth: process.env.NOTION_KEY});
	const n2m = new NotionToMarkdown({notionClient: notion});
	const databaseId = process.env.NOTION_EVENTS_ID;

	const getContent = async id => {
		const mdBlocks = await n2m.pageToMarkdown(id);
		return n2m.toMarkdownString(mdBlocks);
	};

	const db = await notion.databases.query({
		database_id: databaseId,
		sorts: [
			{
				property: 'Data',
				direction: 'ascending'
			}
		],
		filter: {
			property: 'Data',
			date: {
				this_week: {}
			}
		}
	});

	const events = db.results.map(result => {
		// console.log(JSON.stringify(result, null, 2));
		return {
			id: result.id,
			title: result.properties['Título']?.title?.pop().plain_text,
			content: undefined,
			tags: result.properties['Tag']?.select?.name || '',
			date: undefined,
			startTime: undefined,
			endTime: undefined
		};
	});

	for (i = 0; i < events.length; i++) {
		const _page = events[i];
		events[i].content = await getContent(_page.id);
	}

	return {weekEvents: events};
};

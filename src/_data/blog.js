require('dotenv').config();

const {Client} = require('@notionhq/client');
const {NotionToMarkdown} = require('notion-to-md');

module.exports = async () => {
	// const notion = new Client({auth: process.env.NOTION_KEY});
	// const n2m = new NotionToMarkdown({notionClient: notion});
	// const databaseId = process.env.NOTION_BLOG_ID;
	// const dbs = await notion.databases.query({
	// 	database_id: databaseId
	// });
	// const getContent = async id => {};
	// return { posts, latestPost: posts[0], tags, postsByTag }
};
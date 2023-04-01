const dateFilter = require('./src/filters/date-filter.js');
const w3DateFilter = require('./src/filters/w3-date-filter.js');

module.exports = eleventyConfig => {
	// Tell 11ty to use the .eleventyignore and ignore our .gitignore file
	eleventyConfig.setUseGitIgnore(false);

	eleventyConfig.addPassthroughCopy('./src/fonts');
	eleventyConfig.addPassthroughCopy('./src/images');

	// config.addFilter('md', require('./src/filters/md.js'));

	const md = require('markdown-it')({
		html: true,
		linkify: true,
		typographer: true
	});

	eleventyConfig.addFilter('markdownify', markdownString =>
		md.render(markdownString)
	);

	// Filters
	eleventyConfig.addFilter('dateFilter', dateFilter);
	eleventyConfig.addFilter('w3DateFilter', w3DateFilter);

	return {
		markdownTemplateEngine: 'njk',
		dataTemplateEngine: 'njk',
		htmlTemplateEngine: 'njk',
		dir: {
			input: 'src',
			output: 'dist'
		}
	};
};

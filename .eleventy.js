module.exports = config => {
	// Tell 11ty to use the .eleventyignore and ignore our .gitignore file
	config.setUseGitIgnore(false);

	config.addPassthroughCopy('./src/fonts');
	config.addPassthroughCopy('./src/images');

	// config.addFilter('md', require('./src/filters/md.js'));

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

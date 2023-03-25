require('dotenv').config();

const EleventyFetch = require('@11ty/eleventy-fetch');

const xmlBufferToString = require('xml-buffer-tostring');
const {xml2json} = require('xml-js');

const descriptionFormatter = description => {
	const descriptionsArray = description.split('\n');

	return descriptionsArray.slice(0, 0).join('\n');
};

const formatDate = date => {
	const _date = new Date(date);
	const year = _date.getFullYear();
	let month = _date.getMonth() + 1; // Months start at 0!
	let day = _date.getDate();

	if (day < 10) day = '0' + day;
	if (month < 10) month = '0' + month;

	const formattedDate = `${day}/${month}/${year}`;

	return formattedDate;
};

// fetch rss feed
module.exports = async () => {
	// const data = await fetch()
	const buffer = await EleventyFetch(`${process.env.PODCAST_RSS}`, {
		duration: '5d'
	});
	const xmlString = xmlBufferToString(buffer);

	let data = [];

	try {
		const jsonString = xml2json(xmlString, {spaces: 2, compact: true});
		const json = JSON.parse(jsonString);

		data = json.rss.channel.item;
	} catch (error) {
		console.error(error);
	}

	const allEpisodes = data.map(data => ({
		title: data['title']._cdata.trim(),
		description: descriptionFormatter(data['description']._cdata),
		link: data['link']._text,
		publicationDate: formatDate(data['pubDate']._text),
		audioInfo: data['enclosure']._attributes,
		coverImage: data['itunes:image']._attributes.href
	}));

	const latestEpisodes = allEpisodes.splice(0, 3);

	return {allEpisodes, latestEpisodes};
};

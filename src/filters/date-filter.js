const moment = require('moment');

module.exports = value => {
	const dateObject = moment(value).locale('pt-br');
	return `${dateObject.format('D')} de ${dateObject.format('MMMM YYYY')}`;
};

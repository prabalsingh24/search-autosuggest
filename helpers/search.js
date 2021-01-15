const elasticsearch = require('elasticsearch');

let index = 'autosuggest-index';
let client = null;


async function init(elasticsearchConfig){
	client = new elasticsearch.Client(elasticsearchConfig);

	try {
		const indexAlreadyExists = await client.indices.exists({index});
		if (indexAlreadyExists) {
			return null;
		}

		return generateIndex();
	}
	catch (error) {
		return null;
	}
}


async function generateIndex() {
	console.log('regerating index');
}

module.exports = {
	init
}
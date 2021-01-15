const elasticsearch = require('elasticsearch');
const cities = require('../data/cities');

let index = 'cities-index';
let client = null;
const maxBatchSize = 1000;


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

	// first, we will delete the index, if it exists
	const indexAlreadyExists = await client.indices.exists({index});

	if (indexAlreadyExists) {
		await client.indices.delete({index});
	}

	const indexMapping = {
		"mappings": {
		     "cityName": { 
		       "properties": { 
			         "cityName": { "type": "text"  },
		        }
		     }
		}
	}	

	await client.indices.create(
		{body: indexMapping, index}
	);

	
	const bulkBatches = [];

	let idx = 0;
	while(idx < cities.length){
		const currentBatch = [];
		while(idx < cities.length && currentBatch.length < maxBatchSize){
			currentBatch.push({cityName: cities[idx].name});
			idx ++;
		}
		bulkBatches.push(currentBatch);
	}

	await bulkBatches.forEach(async batch => await processCurrentBatch(batch));

	await refreshIndex();	
}

async function processCurrentBatch(batch){
	const bulkOperations = batch.reduce((accumulator, city) => {
		accumulator.push({
			index: {
				_index: index,
				_type: "cityName"
			}
		});
		accumulator.push(city);
		return accumulator;
	}, []);
	
	const response = await client.bulk({
		body: bulkOperations
	});	
}

async function refreshIndex() {
	await client.indices.refresh({index});
}

async function searchByQuery(dslQuery) {
	const response = await client.search(dslQuery);
	return response.hits.hits.map(res => res._source.cityName);
}


async function autocomplete(query, from = 0, size = 5){
	const dslQuery = {
		from,
		body: {
			query: {
				match: {
					'cityName': {
						query,
						fuzziness: 'AUTO'
					}
				}
			}
		},
		size,
		index
	};
	return searchByQuery(dslQuery);
}


module.exports = {
	init,
	autocomplete
}
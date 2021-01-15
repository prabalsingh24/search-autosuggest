const elasticsearch = require('elasticsearch');
const cities = require('../data/cities');

let index = 'cities-index';
let client = null;
const maxBatchSize = 200;


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
		     "city": { 
		       "properties": { 
			         "cityName":     { "type": "keyword"  },
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

	bulkBatches.forEach(batch => processCurrentBatch(batch));

	await refreshIndex();
}

async function processCurrentBatch(batch){
	const bulkOperations = batch.reduce((accumulator, city) => {
		accumulator.push({
			index: {
				_index: index,
				_type: "city"
			}
		});
		accumulator.push(city);
		return accumulator;
	}, []);
	
	await client.bulk({
		body: bulkOperations
	});	
}

function refreshIndex() {
	return client.indices.refresh({index});
}

module.exports = {
	init
}
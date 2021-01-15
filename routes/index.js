const express = require('express');
const router = express.Router();
const search = require('../helpers/search');


router.get('/search/autocomplete', async (req, res) => {
	const query = req.query.q || null;
	const from = req.query.from || 0;
	const size = req.query.size || 5;
	if(query){
		const response = await search.autocomplete(query, from, size);
		res.send({cityNames: response});
	}
	else {
		res.status(400).send({error: "bad request, query not present"});
	}
})


module.exports = router

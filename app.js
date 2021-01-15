const express = require('express')
const app = express();
const port = 8000;
const routes = require('./routes');
const search = require('./helpers/search')
const config = require('./config/config')


// setup the routes
app.use(routes);

// setup elasticsearch
search.init(config.search);


app.listen(port, () => {
  console.log(`Listening on port ${port}!`)
});
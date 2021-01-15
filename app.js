const express = require('express')
const app = express();
const routes = require('./routes');
const cors = require('cors');
const search = require('./helpers/search')
const config = require('./config/config')
const port = 8000;


app.use(cors());
// setup the routes
app.use(routes);
// setup elasticsearch
search.init(config.search);


app.listen(port, () => {
  console.log(`Listening on port ${port}!`)
});
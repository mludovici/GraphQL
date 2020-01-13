const express = require('express');
const expressGraphQL = require('express-graphql');
const schema = require('./src/schema');

const app = express();

app.use(bodyParser.json());
app.use('/graphql', expressGraphQL({
  schema,
  graphiql: true
}));

module.exports = app;

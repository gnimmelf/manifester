'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var graphqlHTTP = require('express-graphql');

exports.default = graphqlHTTP({
  schema: MyGraphQLSchema,
  graphiql: true
});
//# sourceMappingURL=graphql.js.map

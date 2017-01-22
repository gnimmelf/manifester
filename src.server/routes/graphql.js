const graphqlHTTP = require('express-graphql');

export default graphqlHTTP({
  schema: MyGraphQLSchema,
  graphiql: true
});
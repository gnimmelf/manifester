import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList
} from 'graphql';

import graphqlHTTP from 'express-graphql';

var TODOs = [
  {
    "id": 1,
    "title": "Read emails",
    "completed": false
  },
  {
    "id": 2,
    "title": "Buy orange",
    "completed": true
  }
];

var TodoType = new GraphQLObjectType({
  name: 'todo',
  fields: function () {
    return {
      id: {
        type: GraphQLInt
      },
      title: {
        type: GraphQLString
      },
      completed: {
        type: GraphQLBoolean
      }
    }
  }
});

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: function () {
    return {
      todos: {
        type: new GraphQLList(TodoType),
        resolve: function () {
          return TODOs;
        }
      }
    }
  }
});


const schema = new GraphQLSchema({
  query: queryType
});

export default graphqlHTTP({
  schema: schema,
  graphiql: true,
  pretty: true,
});



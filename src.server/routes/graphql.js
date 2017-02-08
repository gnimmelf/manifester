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

import { promiseFiles } from '../lib/google/drive';

var FileType = new GraphQLObjectType({
  name: 'file',
  fields: function () {
    return {
      title: {
        type: GraphQLString
      },
      id: {
        type: GraphQLString
      },
      content: {
        type: GraphQLString
      }
    }
  }
});

var queryType = new GraphQLObjectType({
  name: 'Query',
  fields: function () {
    return {
      files: {
        type: new GraphQLList(FileType),
        resolve: function () {
          return promiseFiles();
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



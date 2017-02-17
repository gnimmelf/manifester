import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLList
} from 'graphql';
import {
  TimestampType
} from './graphql-types'

import graphqlHTTP from 'express-graphql';

import { queryFiles } from '../../lib/g-drive/files';

var FileType = new GraphQLObjectType(
{
  name: 'file',
  fields: function () {
    return {
      title: {
        type: GraphQLString
      },
      id: {
        type: GraphQLString
      },
      mimeType: {
        type: GraphQLString
      },
      content: {
        type: GraphQLString
      },
      modifiedTime: {
        type: TimestampType,
      },
    }
  }
});

var queryType = new GraphQLObjectType(
{
  name: 'Query',
  fields: function () {
    return {
      files: {
        type: new GraphQLList(FileType),
        resolve: function () {
          return getQueryFiles("'0B4gB3nV9reGKWURSdDdWeGdBU1k' in parents and trashed = false and name contains '*.md'").toPromise();
        }
      }
    }
  }
});

const schema = new GraphQLSchema(
{
  query: queryType
});

export default graphqlHTTP(
{
  schema: schema,
  graphiql: true,
  pretty: true,
});



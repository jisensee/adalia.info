import { GraphQLSchema } from 'graphql'
import 'graphql-import-node'
import { makeExecutableSchema } from 'graphql-tools'
import resolvers from './resolvers'
import * as typeDefs from './schema.graphql'

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false,
  },
})

export default schema

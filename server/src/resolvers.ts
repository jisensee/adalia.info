import { MongoDataSource } from 'apollo-datasource-mongodb'
import { IResolvers } from 'graphql-tools'
import { Context, DataSources } from './context'

const resolvers: IResolvers<DataSources, Context> = {
  Query: {
    asteroids: (parent, args, { dataSources }) =>
      dataSources.asteroids.getAll(),
  },
}

export default resolvers

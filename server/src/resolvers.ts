import { IResolvers } from 'graphql-tools'
import { Context, DataSources } from './context'
import { PageInput, QueryAsteroidsArgs, SortingMode } from './types'

const resolvers: IResolvers<DataSources, Context> = {
  Query: {
    asteroids: (_, args: QueryAsteroidsArgs, { dataSources }) =>
      dataSources.asteroids.getPage(
        {
          ...args.page,
          size: Math.min(args.page.size, 100),
        },
        args.sorting
      ),
  },
}

export default resolvers

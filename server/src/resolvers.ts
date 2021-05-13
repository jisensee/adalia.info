import { IResolvers } from 'graphql-tools'
import { Context, DataSources } from './context'

interface PageInput {
  size: number
  num: number
}

const resolvers: IResolvers<DataSources, Context> = {
  Query: {
    asteroids: (_, { page }: { page: PageInput }, { dataSources }) =>
      dataSources.asteroids.getPage(Math.max(page.size, 100), page.num),
  },
}

export default resolvers

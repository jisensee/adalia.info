import { IResolvers } from 'graphql-tools'
import { Context, DataSources } from './context'
import getExchangeRates from './exchange-rates'
import * as exporter from './exporter'
import { dateScalar } from './scalars'
import {
  Asteroid,
  AsteroidStats,
  MutationExportAllAsteroidsArgs,
  MutationExportAsteroidsArgs,
  QueryAsteroidArgs,
  QueryAsteroidsArgs,
  QueryAsteroidStatsArgs,
} from './types'

const resolvers: IResolvers<DataSources, Context> = {
  Date: dateScalar,
  Query: {
    asteroids: (_, args: QueryAsteroidsArgs, { dataSources }) =>
      dataSources.asteroids.getPage(
        {
          ...args.page,
          size: Math.min(args.page.size, 100),
        },
        args.sorting,
        args.filter
      ),
    asteroidStats: async (_, args: QueryAsteroidStatsArgs, { dataSources }) =>
      dataSources.asteroids.stats(args.filter),
    asteroid: (_, args: QueryAsteroidArgs, { dataSources }) =>
      dataSources.asteroids.getByRockId(args.id),
    lastDataUpdateAt: (_, _args, { dataSources }) =>
      dataSources.asteroidImports.getLast().then((imp) => imp?.lastRun),
    priceBounds: (_, _args, { dataSources }) =>
      dataSources.asteroids.getPriceBounds(),
    exchangeRates: () => getExchangeRates(),
  },
  Mutation: {
    exportAsteroids: async (
      _,
      args: MutationExportAsteroidsArgs,
      { dataSources }
    ) => {
      const exportPath = exporter.getPath(
        args.filter,
        args.sorting,
        args.format
      )
      if (await exporter.doesExportExist(exportPath)) {
        return exportPath
      }
      const writeStream = exporter.writeStream(
        args.filter,
        args.sorting,
        args.format
      )
      const fullExport = !args.filter && !args.sorting
      dataSources.asteroids.exportAsteroids(
        args.filter,
        args.sorting,
        args.format,
        fullExport,
        writeStream
      )
      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => resolve(exportPath))
        writeStream.on('error', reject)
      })
    },
    exportAllAsteroids: async (
      _,
      args: MutationExportAllAsteroidsArgs,
      { dataSources }
    ) => {
      const exportPath = exporter.getFullExportPath(args.format)
      if (await exporter.doesExportExist(exportPath)) {
        return exportPath
      }
      const writeStream = exporter.writeStreamFull(args.format)
      dataSources.asteroids.exportAsteroids(
        null,
        null,
        args.format,
        true,
        writeStream
      )
      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => resolve(exportPath))
        writeStream.on('error', reject)
      })
    },
  },
}

export default resolvers

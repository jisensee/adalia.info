import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { Db, MongoClient } from 'mongodb'
import {
  runInitialDataImport,
  startApiImportJob,
} from './asteroid-import/asteroid-importer'
import { DataSources } from './context'
import AsteroidImportInfoDataSource from './db/AsteroidImportInfoDataSource'
import AsteroidsDataSource from './db/AsteroidsDataSource'
import { getExportPath, initExporter, resetExports } from './exporter'
import schema from './schema'

const app = express()
app.listen(5000, () => console.log('Server started on port 5000'))

const init = async (ds: DataSources) => {
  await runInitialDataImport(ds)
  await startApiImportJob(ds, () => resetExports(ds.asteroids))
  await initExporter(ds.asteroids)
}

const createApolloServer = (dataSources: DataSources) => {
  const server = new ApolloServer({
    schema,
    playground: true,
    introspection: true,
    dataSources: () => ({
      ...dataSources,
    }),
  })
  server.applyMiddleware({ app, path: '/graphql' })
}

const setupRoutes = () => {
  app.get('/exports/:filename', (req, res) => {
    const filename = req.params['filename']
    res.download(getExportPath(filename))
  })
}

const createMongoDbClient = () => {
  const mongoUrl = process.env.MONGO_URL ?? 'localhost:27017'
  const mongoConnectionStr = `mongodb://${mongoUrl}/adalia-info`
  return new MongoClient(mongoConnectionStr, {
    useUnifiedTopology: true,
  })
}

const createDateSources = (db: Db): DataSources => ({
  asteroids: new AsteroidsDataSource(db.collection('asteroids')),
  asteroidImports: new AsteroidImportInfoDataSource(
    db.collection('asteroid-import-info')
  ),
})

createMongoDbClient()
  .connect()
  .then((client) => {
    const dataSources = createDateSources(client.db())
    createApolloServer(dataSources)
    setupRoutes()
    init(dataSources)
  })

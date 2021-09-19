import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { MongoClient } from 'mongodb'
import AsteroidsDataSource from './db/AsteroidsDataSource'
import schema from './schema'
import { runImport } from './asteroid-import/asteroid-importer'
import AsteroidImportInfoDataSource from './db/AsteroidImportInfoDataSource'
import { getExportPath, init as initExporter } from './exporter'

const app = express()

const mongoUrl = process.env.MONGO_URL ?? 'localhost:27017'
const mongoConnectionStr = `mongodb://${mongoUrl}/adalia-info`
const client = new MongoClient(mongoConnectionStr, {
  useUnifiedTopology: true,
})
client
  .connect()
  .then((client) => client.db())
  .then(async (db) => {
    await runImport(db)
    initExporter(db)
  })

const server = new ApolloServer({
  schema,
  playground: true,
  introspection: true,
  dataSources: () => ({
    asteroids: new AsteroidsDataSource(client.db().collection('asteroids')),
    asteroidImports: new AsteroidImportInfoDataSource(
      client.db().collection('asteroid-import-info')
    ),
  }),
})

server.applyMiddleware({ app, path: '/graphql' })

app.listen(5000, () => console.log('Server started on port 5000'))

app.get('/exports/:filename', (req, res) => {
  const filename = req.params['filename']
  res.download(getExportPath(filename))
})

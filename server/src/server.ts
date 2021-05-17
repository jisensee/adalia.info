import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { MongoClient } from 'mongodb'
import { initializeAsteroids } from './initializer'
import AsteroidsDataSource from './db/AsteroidsDataSource'
import schema from './schema'

const app = express()

const mongoUrl = process.env.MONGO_URL ?? 'localhost:27017'
const mongoConnectionStr = `mongodb://${mongoUrl}/adalia-info`
const client = new MongoClient(mongoConnectionStr, {
  useUnifiedTopology: true,
})
client
  .connect()
  .then((client) => client.db().collection('asteroids'))
  .then(initializeAsteroids)

const server = new ApolloServer({
  schema,
  playground: true,
  introspection: true,
  dataSources: () => ({
    asteroids: new AsteroidsDataSource(client.db().collection('asteroids')),
  }),
})

server.applyMiddleware({ app, path: '/graphql' })

app.listen(5000, () => console.log('Server started on port 5000'))

import Asteroids from './asteroids'

export interface DataSources {
  asteroids: Asteroids
}

export interface Context {
  dataSources: DataSources
}

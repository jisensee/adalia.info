import AsteroidsDataSource from './db/AsteroidsDataSource'

export interface DataSources {
  asteroids: AsteroidsDataSource
}

export interface Context {
  dataSources: DataSources
}

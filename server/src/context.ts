import AsteroidImportInfoDataSource from './db/AsteroidImportInfoDataSource'
import AsteroidsDataSource from './db/AsteroidsDataSource'

export interface DataSources {
  asteroids: AsteroidsDataSource
  asteroidImports: AsteroidImportInfoDataSource
}

export interface Context {
  dataSources: DataSources
}

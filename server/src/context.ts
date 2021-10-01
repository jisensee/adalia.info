import AsteroidImportInfoDataSource from './db/asteroid-import-info-data-source'
import AsteroidsDataSource from './db/asteroids-data-source'

export interface DataSources {
  asteroids: AsteroidsDataSource
  asteroidImports: AsteroidImportInfoDataSource
}

export interface Context {
  dataSources: DataSources
}

import { Asteroid } from '../types'

export enum ImportType {
  MockData = 'MockData',
  StaticDump = 'StaticDump',
  Api = 'Api',
}

export interface AsteroidImportInfo {
  type: ImportType
  lastRun: Date
}

export type persistFunc = (rocks: Asteroid[]) => Promise<void>
export interface AsteroidImporter {
  run: (persist: persistFunc) => Promise<void>
  type: ImportType
}

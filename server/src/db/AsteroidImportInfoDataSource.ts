import { MongoDataSource } from 'apollo-datasource-mongodb'
import { Collection } from 'mongodb'
import { AsteroidImportInfo } from '../asteroid-import/asteroid-import'

export default class AsteroidImportInfoDataSource extends MongoDataSource<AsteroidImportInfo> {
  constructor(collection: Collection<AsteroidImportInfo>) {
    super(collection)
  }

  async getLast() {
    const imports = await this.collection
      .find({})
      .sort({ lastRun: -1 })
      .limit(1)
      .toArray()
    return imports.length === 0 ? null : imports[0]
  }
}

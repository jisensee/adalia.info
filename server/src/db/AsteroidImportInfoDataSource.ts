import { MongoDataSource } from 'apollo-datasource-mongodb'
import { Collection } from 'mongodb'
import {
  AsteroidImportInfo,
  ImportType,
} from '../asteroid-import/asteroid-import'

export default class AsteroidImportInfoDataSource extends MongoDataSource<AsteroidImportInfo> {
  constructor(collection: Collection<AsteroidImportInfo>) {
    super(collection)
  }

  public async getLast() {
    const imports = await this.collection
      .find({})
      .sort({ lastRun: -1 })
      .limit(1)
      .toArray()
    return imports.length === 0 ? null : imports[0]
  }

  public async updateImportInfo(importType: ImportType) {
    const query = { type: importType }
    const lastRun = new Date()
    const update = { $set: { lastRun } }
    await this.collection.updateOne(query, update, { upsert: true })
    console.log(`Saving last asteroid run at ${lastRun.toISOString()}`)
  }
}

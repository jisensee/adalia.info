import { MongoDataSource } from 'apollo-datasource-mongodb'
import { Collection } from 'mongodb'

export interface Asteroid {
  id: number
  name: string
  owner?: string
  price?: number
  spectralType: SpectralType
  radius: number
  surfaceArea: number
  orbitalPeriod: number
  semiMajorAxis: number
  inclination: number
}

export interface AsteroidPage {
  rows: Asteroid[]
  totalRows: number
}

export enum SpectralType {
  C = 'C',
  CM = 'CM',
  CI = 'CI',
  CS = 'CS',
  CMS = 'CMS',
  CIS = 'CIS',
  S = 'S',
  SM = 'SM',
  SI = 'SI',
  M = 'M',
  I = 'I',
}

export default class Asteroids extends MongoDataSource<Asteroid> {
  constructor(collection: Collection<Asteroid>) {
    super(collection)
  }

  public async getPage(
    pageSize: number,
    pageNum: number
  ): Promise<AsteroidPage> {
    const offset = (pageNum - 1) * pageSize
    const rows = await this.collection
      .find()
      .skip(offset)
      .limit(pageSize)
      .toArray()
    return {
      rows,
      totalRows: await this.collection.countDocuments(),
    }
  }
}

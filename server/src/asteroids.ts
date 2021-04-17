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

  public getAll() {
    return this.collection.find().toArray()
  }
}

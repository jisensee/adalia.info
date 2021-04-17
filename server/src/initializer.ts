import { Collection } from 'apollo-datasource-mongodb'
import { Asteroid, SpectralType } from './asteroids'

const initialData: Asteroid[] = [
  {
    id: 1,
    name: 'a1',
    owner: 'me',
    radius: 1,
    surfaceArea: 2,
    semiMajorAxis: 23,
    inclination: 12,
    orbitalPeriod: 34,
    spectralType: SpectralType.I,
  },
  {
    id: 2,
    name: 'a2',
    price: 123,
    radius: 1,
    surfaceArea: 2,
    semiMajorAxis: 23,
    inclination: 12,
    orbitalPeriod: 34,
    spectralType: SpectralType.CMS,
  },
]

export default async function initialize(collection: Collection<Asteroid>) {
  const count = await collection.countDocuments()
  if (count > 0) {
    await collection.drop()
  }
  await collection.insertMany(initialData)
  console.log('Updated asteroids')
}

import { Collection } from 'apollo-datasource-mongodb'
import { Asteroid, SpectralType } from './types'

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min)) + min

const randomSpectraltype = () =>
  [
    SpectralType.C,
    SpectralType.Ci,
    SpectralType.Cis,
    SpectralType.Cm,
    SpectralType.Cms,
    SpectralType.Cs,
    SpectralType.I,
    SpectralType.M,
    SpectralType.M,
    SpectralType.Si,
    SpectralType.Sm,
  ][randomInt(0, 11)]

const randomRoid = (id: number): Asteroid => ({
  id: id,
  name: `name ${id}`,
  owner: [`owner-${id}`, null][randomInt(0, 2)],
  radius: randomInt(100, 10000),
  surfaceArea: randomInt(200, 20000),
  semiMajorAxis: randomInt(0, 50),
  inclination: randomInt(0, 20),
  orbitalPeriod: randomInt(700, 3000),
  spectralType: randomSpectraltype(),
})

const initialData: Asteroid[] = [...Array(250_000).keys()].map((id) =>
  randomRoid(id + 1)
)

export async function initializeAsteroids(collection: Collection<Asteroid>) {
  const count = await collection.countDocuments()
  if (count > 0) {
    await collection.drop()
  }
  await collection.insertMany(initialData)
  console.log('Updated asteroids')
}

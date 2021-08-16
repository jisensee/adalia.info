import { Asteroid, AsteroidSize, SpectralType } from '../types'
import { AsteroidImporter, ImportType } from './asteroid-import'

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
    SpectralType.S,
    SpectralType.Si,
    SpectralType.Sm,
  ][randomInt(0, 11)]

const randomSize = () =>
  [
    AsteroidSize.Small,
    AsteroidSize.Medium,
    AsteroidSize.Large,
    AsteroidSize.Huge,
  ][randomInt(0, 4)]

const randomRoid = (id: number): Asteroid => ({
  id: id,
  baseName: `baseName ${id}`,
  name: `name ${id}`,
  owner: [`owner-${id}`, null][randomInt(0, 2)],
  size: randomSize(),
  scanned: randomInt(0, 2) === 0,
  radius: randomInt(100, 10000),
  surfaceArea: randomInt(200, 20000),
  semiMajorAxis: randomInt(0, 50),
  inclination: randomInt(0, 20),
  orbitalPeriod: randomInt(700, 3000),
  spectralType: randomSpectraltype(),
  eccentricity: randomInt(0, 5),
  estimatedPrice: randomInt(75, 5_000_000),
})

const randomImporter: AsteroidImporter = {
  run: async (persist) => {
    const data: Asteroid[] = [...Array(250_000).keys()].map((id) =>
      randomRoid(id + 1)
    )
    return persist(data)
  },
  type: ImportType.MockData,
}

export default randomImporter

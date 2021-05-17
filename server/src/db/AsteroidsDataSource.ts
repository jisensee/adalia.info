import { MongoDataSource } from 'apollo-datasource-mongodb'
import { Collection } from 'mongodb'
import {
  Asteroid,
  AsteroidCount,
  AsteroidField,
  AsteroidFilterInput,
  AsteroidPage,
  AsteroidSortingInput,
  Maybe,
  PageInput,
  SortingMode,
  SpectralType,
} from '../types'

const fieldToSortName = (field: AsteroidField): keyof Asteroid => {
  switch (field) {
    case AsteroidField.Id:
      return 'id'
    case AsteroidField.Inclination:
      return 'inclination'
    case AsteroidField.Name:
      return 'name'
    case AsteroidField.OrbitalPeriod:
      return 'orbitalPeriod'
    case AsteroidField.Owner:
      return 'owner'
    case AsteroidField.Radius:
      return 'radius'
    case AsteroidField.SemiMajorAxis:
      return 'semiMajorAxis'
    case AsteroidField.SpectralType:
      return 'spectralType'
    case AsteroidField.SurfaceArea:
      return 'surfaceArea'
  }
}

const createSortParam = (sorting: AsteroidSortingInput) => {
  const sortName = fieldToSortName(sorting.field)
  const idSortName = fieldToSortName(AsteroidField.Id)
  const mode = sorting.mode == SortingMode.Ascending ? 1 : -1
  return {
    [sortName]: mode,
    [idSortName]: mode,
  }
}

const ownedFilter = (owned: boolean) => ({
  owner: {
    [owned ? '$ne' : '$eq']: null,
  },
})

const spectralTypesFilter = (spectralTypes: SpectralType[]) => ({
  spectralType: { $in: spectralTypes },
})

const filterToQuery = (filter: AsteroidFilterInput) => {
  const owned = filter.owned === null ? {} : ownedFilter(filter.owned)
  const spectralTypes = filter.spectralTypes
    ? spectralTypesFilter([...filter.spectralTypes])
    : {}

  return { $and: [owned, spectralTypes] }
}

export default class AsteroidsDataSource extends MongoDataSource<Asteroid> {
  constructor(collection: Collection<Asteroid>) {
    super(collection)
  }

  public async getPage(
    page: PageInput,
    sorting: Maybe<AsteroidSortingInput>,
    filter: Maybe<AsteroidFilterInput>
  ): Promise<AsteroidPage> {
    const offset = (page.num - 1) * page.size
    const sortParam = sorting != null ? createSortParam(sorting) : {}
    const query = filter ? filterToQuery(filter) : {}

    const cursor = this.collection
      .find(query)
      .sort(sortParam)
      .skip(offset)
      .limit(page.size)

    const totalRows = await cursor.count()
    const rows = await cursor.toArray()

    return { rows, totalRows }
  }

  public async count(
    filter: Maybe<AsteroidFilterInput>
  ): Promise<AsteroidCount> {
    const total = await this.collection.countDocuments()
    const count = filter
      ? await this.collection.countDocuments(filterToQuery(filter))
      : total

    return {
      count,
      total,
    }
  }
}

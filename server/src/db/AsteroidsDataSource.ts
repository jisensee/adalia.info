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

const filterToQuery = (filter: AsteroidFilterInput) => {
  const owned = filter.owned === null ? {} : ownedFilter(filter.owned)

  return { ...owned }
}

export default class AsteroidsDataSource extends MongoDataSource<Asteroid> {
  constructor(collection: Collection<Asteroid>) {
    super(collection)
  }

  public async getPage(
    page: PageInput,
    sorting: Maybe<AsteroidSortingInput>
  ): Promise<AsteroidPage> {
    const offset = (page.num - 1) * page.size
    const sortParam = sorting != null ? createSortParam(sorting) : {}
    const rows = await this.collection
      .find()
      .sort(sortParam)
      .skip(offset)
      .limit(page.size)
      .toArray()
    return {
      rows,
      totalRows: await this.collection.countDocuments(),
    }
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

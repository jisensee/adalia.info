import { MongoDataSource } from 'apollo-datasource-mongodb'
import crypto from 'crypto'
import { Transform } from 'json2csv'
import { BulkWriteUpdateOneOperation, Collection, Cursor } from 'mongodb'
import {
  Asteroid,
  AsteroidBonusesFilterInput,
  AsteroidBonusesFilterMode,
  AsteroidBonusType,
  AsteroidField,
  AsteroidFilterInput,
  AsteroidPage,
  AsteroidRarity,
  AsteroidSize,
  AsteroidSortingInput,
  AsteroidStats,
  BasicAsteroidStats,
  ExportFormat,
  Maybe,
  PageInput,
  PriceBounds,
  RangeInput,
  RarityCounts,
  SortingMode,
  SpectralType,
  SpectralTypeCounts,
} from '../types'

const csvBaseFields: (keyof Asteroid)[] = [
  'id',
  'name',
  'baseName',
  'owner',
  'scanned',
  'spectralType',
  'size',
  'rarity',
  'estimatedPrice',
  'radius',
  'surfaceArea',
  'semiMajorAxis',
  'orbitalPeriod',
  'inclination',
  'eccentricity',
]
const csvFieldYield = 'bonus:Yield'
const csvFieldVolatile = 'bonus:Volatile'
const csvFieldOrganic = 'bonus:Organic'
const csvFieldMetal = 'bonus:Metal'
const csvFieldRareEart = 'bonus:RareEarth'
const csvFieldFissile = 'bonus:Fissile'
const csvFields = [
  ...csvBaseFields,
  csvFieldYield,
  csvFieldVolatile,
  csvFieldOrganic,
  csvFieldMetal,
  csvFieldRareEart,
  csvFieldFissile,
  'bonuses',
]

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
    case AsteroidField.Scanned:
      return 'scanned'
    case AsteroidField.Radius:
      return 'radius'
    case AsteroidField.SemiMajorAxis:
      return 'semiMajorAxis'
    case AsteroidField.SpectralType:
      return 'spectralType'
    case AsteroidField.SurfaceArea:
      return 'surfaceArea'
    case AsteroidField.Size:
      return 'size'
    case AsteroidField.Eccentricity:
      return 'eccentricity'
    case AsteroidField.EstimatedPrice:
      return 'estimatedPrice'
    case AsteroidField.Rarity:
      return 'rarity'
  }
}

const createSortParam = (sorting: AsteroidSortingInput) => {
  const sortName = fieldToSortName(sorting.field)
  const mode = sorting.mode == SortingMode.Ascending ? 1 : -1
  return {
    [sortName]: mode,
  }
}

const ownedFilter = (owned: boolean) => ({
  owner: {
    [owned ? '$ne' : '$eq']: null,
  },
})

const ownersFilter = (owners: String[]) => ({
  owner: {
    $in: owners.map((o) => o.substr(0, 50)).map((o) => o.toLowerCase()),
  },
})

const spectralTypesFilter = (spectralTypes: SpectralType[]) => ({
  spectralType: { $in: spectralTypes },
})

const rangeFilter = (range: RangeInput, fieldName: keyof Asteroid) => ({
  [fieldName]: {
    $gte: range.from,
    $lte: range.to,
  },
})

const sizesFilter = (sizes: AsteroidSize[]) => ({
  size: { $in: sizes },
})

const raritiesFiletr = (rarities: AsteroidRarity[]) => ({
  rarity: { $in: rarities },
})

const bonusesFilter = (filter: AsteroidBonusesFilterInput) => {
  const mode = filter.mode == AsteroidBonusesFilterMode.And ? '$and' : '$or'
  const conditions = filter.conditions
    .filter(
      (condition) => condition.type || (condition.levels?.length ?? 0) > 0
    )
    .map((condition) => {
      const elemMatch: any = {}
      if (condition.type) {
        elemMatch.type = condition.type
      }
      if (condition.levels && condition.levels.length > 0) {
        elemMatch.level = {
          $in: condition.levels,
        }
      }
      return {
        bonuses: {
          $elemMatch: elemMatch,
        },
      }
    })
  return conditions.length > 0
    ? {
        [mode]: conditions,
      }
    : {}
}

const filterToQuery = (filter: Maybe<AsteroidFilterInput>) => {
  if (!filter) {
    return {}
  }
  const owned = filter.owned == null ? {} : ownedFilter(filter.owned)
  const owners = filter.owners == null ? {} : ownersFilter([...filter.owners])
  const scanned = filter.scanned == null ? {} : { scanned: filter.scanned }
  const spectralTypes = filter.spectralTypes
    ? spectralTypesFilter([...filter.spectralTypes])
    : {}
  const radius = filter.radius ? rangeFilter(filter.radius, 'radius') : {}
  const surface = filter.surfaceArea
    ? rangeFilter(filter.surfaceArea, 'surfaceArea')
    : {}
  const sizes = filter.sizes ? sizesFilter([...filter.sizes]) : {}
  const orbitalPeriod = filter.orbitalPeriod
    ? rangeFilter(filter.orbitalPeriod, 'orbitalPeriod')
    : {}
  const semiMajorAxis = filter.semiMajorAxis
    ? rangeFilter(filter.semiMajorAxis, 'semiMajorAxis')
    : {}
  const inclination = filter.inclination
    ? rangeFilter(filter.inclination, 'inclination')
    : {}
  const eccentricity = filter.eccentricity
    ? rangeFilter(filter.eccentricity, 'eccentricity')
    : {}
  const priceEstimate = filter.estimatedPrice
    ? rangeFilter(filter.estimatedPrice, 'estimatedPrice')
    : {}
  const rarities = filter.rarities ? raritiesFiletr([...filter.rarities]) : {}
  const bonuses = filter.bonuses ? bonusesFilter(filter.bonuses) : {}

  return {
    $and: [
      owned,
      owners,
      scanned,
      spectralTypes,
      radius,
      surface,
      sizes,
      orbitalPeriod,
      semiMajorAxis,
      inclination,
      eccentricity,
      priceEstimate,
      rarities,
      bonuses,
    ],
  }
}

export default class AsteroidsDataSource extends MongoDataSource<Asteroid> {
  private statsCache: { [key: string]: AsteroidStats } = {}

  constructor(collection: Collection<Asteroid>) {
    super(collection)
  }

  public clearCache() {
    const size = Object.keys(this.statsCache).length
    this.statsCache = {}
    console.log(`Cleared stats cache of size ${size}`)
  }

  private hashFilter(filter: Maybe<AsteroidFilterInput>) {
    return crypto
      .createHash('md5')
      .update(JSON.stringify(filter ?? {}))
      .digest('hex')
  }

  private getStatsFromCache(filter: Maybe<AsteroidFilterInput>) {
    const hash = this.hashFilter(filter)
    if (hash in this.statsCache) {
      return this.statsCache[hash]
    }
    return null
  }

  private cacheStats(filter: Maybe<AsteroidFilterInput>, stats: AsteroidStats) {
    const hash = this.hashFilter(filter)
    this.statsCache[hash] = stats
  }

  public async getPage(
    page: PageInput,
    sorting: Maybe<AsteroidSortingInput>,
    filter: Maybe<AsteroidFilterInput>
  ): Promise<AsteroidPage> {
    const offset = (page.num - 1) * page.size
    const sortParam = sorting != null ? createSortParam(sorting) : {}
    const query = filterToQuery(filter)

    const totalRows = await this.collection.countDocuments(query)
    const rows = await this.collection
      .find(query)
      .sort(sortParam)
      .skip(offset)
      .limit(page.size)
      .toArray()

    return { rows, totalRows }
  }

  public async stats(
    filter: Maybe<AsteroidFilterInput>
  ): Promise<AsteroidStats> {
    const cached = this.getStatsFromCache(filter)
    if (cached) {
      return cached
    }
    const [stats, spTypes, rarities] = await Promise.all([
      this.basicStats(filter),
      this.countByType(filter),
      this.countByRarity(filter),
    ])
    const fullStats = {
      basicStats: stats,
      bySpectralType: spTypes,
      byRarity: rarities,
    }
    this.cacheStats(filter, fullStats)
    return fullStats
  }

  public async basicStats(
    filter: Maybe<AsteroidFilterInput>
  ): Promise<BasicAsteroidStats> {
    const query = filterToQuery(filter)
    const count = await this.collection.countDocuments(query)

    type aggRes = {
      surfaceArea: number
      unowned: number
      scanned: number
    }
    const sums = (
      await this.collection
        .aggregate<aggRes>([
          {
            $match: query,
          },
          {
            $group: {
              _id: 'sum',
              surfaceArea: { $sum: '$surfaceArea' },
              unowned: { $sum: { $ifNull: ['$owner', 1, 0] } },
              scanned: { $sum: { $cond: ['$scanned', 1, 0] } },
            },
          },
        ])
        .toArray()
    )[0]

    return {
      count,
      surfaceArea: sums.surfaceArea,
      owned: count - sums.unowned,
      scanned: sums.scanned,
    }
  }

  public async getByRockId(id: number) {
    return this.collection.find({ id }).next()
  }

  public async getPriceBounds(): Promise<PriceBounds> {
    const r = await this.collection
      .aggregate<PriceBounds>([
        {
          $group: {
            _id: 'bounds',
            min: {
              $min: '$estimatedPrice',
            },
            max: {
              $max: '$estimatedPrice',
            },
          },
        },
      ])
      .next()

    if (!r) {
      throw Error()
    }
    return r
  }

  private transformToCsv(
    cursor: Cursor<Asteroid>,
    writer: NodeJS.WritableStream
  ) {
    return cursor
      .stream({
        transform: (asteroid) => {
          const getMod = (type: AsteroidBonusType) =>
            asteroid.bonuses.find((b) => b.type === type)?.modifier
          const obj = {
            ...asteroid,
            [csvFieldYield]: getMod(AsteroidBonusType.Yield),
            [csvFieldVolatile]: getMod(AsteroidBonusType.Volatile),
            [csvFieldOrganic]: getMod(AsteroidBonusType.Organic),
            [csvFieldMetal]: getMod(AsteroidBonusType.Metal),
            [csvFieldRareEart]: getMod(AsteroidBonusType.RareEarth),
            [csvFieldFissile]: getMod(AsteroidBonusType.Fissile),
          } as any
          return JSON.stringify(obj) + `\n`
        },
      })
      .pipe(new Transform({ fields: csvFields }))
      .pipe(writer)
  }

  public exportAsteroids(
    filter: Maybe<AsteroidFilterInput>,
    sorting: Maybe<AsteroidSortingInput>,
    format: ExportFormat,
    full: boolean,
    writer: NodeJS.WritableStream
  ) {
    const getSortParam = () => {
      if (full || !sorting) {
        return { id: 1 }
      }
      return createSortParam(sorting)
    }
    const getQuery = () => {
      if (full || !filter) {
        return {}
      }
      return filterToQuery(filter)
    }
    const cursor = this.collection.find(getQuery()).sort(getSortParam())

    switch (format) {
      case ExportFormat.Json:
        return cursor
          .stream({ transform: (o) => JSON.stringify(o) + `\n` })
          .pipe(writer)
      case ExportFormat.Csv:
        return this.transformToCsv(cursor, writer)
    }
  }

  public async countByType(
    filter: Maybe<AsteroidFilterInput>
  ): Promise<SpectralTypeCounts> {
    const query = filterToQuery(filter)

    type aggRes = { _id: SpectralType; count: number }

    const result = await this.collection
      .aggregate<aggRes>([
        {
          $match: query,
        },
        {
          $group: {
            _id: '$spectralType',
            count: {
              $sum: 1,
            },
          },
        },
      ])
      .toArray()

    const findCount = (t: SpectralType) =>
      result.find((r) => r._id === t)?.count ?? 0

    return {
      c: findCount(SpectralType.C),
      cs: findCount(SpectralType.Cs),
      ci: findCount(SpectralType.Ci),
      cm: findCount(SpectralType.Cm),
      cis: findCount(SpectralType.Cis),
      cms: findCount(SpectralType.Cms),
      s: findCount(SpectralType.S),
      si: findCount(SpectralType.Si),
      sm: findCount(SpectralType.Sm),
      m: findCount(SpectralType.M),
      i: findCount(SpectralType.I),
    }
  }

  public async countByRarity(
    filter: Maybe<AsteroidFilterInput>
  ): Promise<RarityCounts> {
    const query = filterToQuery(filter)
    type aggRes = { _id: AsteroidRarity; count: number }

    const result = await this.collection
      .aggregate<aggRes>([
        { $match: query },
        {
          $group: {
            _id: '$rarity',
            count: {
              $sum: 1,
            },
          },
        },
      ])
      .toArray()
    const findCount = (t: AsteroidRarity) =>
      result.find((r) => r._id === t)?.count ?? 0

    return {
      common: findCount(AsteroidRarity.Common),
      uncommon: findCount(AsteroidRarity.Uncommon),
      rare: findCount(AsteroidRarity.Rare),
      superior: findCount(AsteroidRarity.Superior),
      exceptional: findCount(AsteroidRarity.Exceptional),
      incomparable: findCount(AsteroidRarity.Incomparable),
    }
  }

  public createIndexes() {
    const keys: Array<keyof Asteroid> = [
      'id',
      'name',
      'owner',
      'radius',
      'surfaceArea',
      'semiMajorAxis',
      'inclination',
      'orbitalPeriod',
      'spectralType',
      'eccentricity',
      'size',
      'baseName',
      'scanned',
      'rarity',
      'bonuses',
    ]
    return this.collection.createIndexes(
      keys.map((key) => ({ key: { [key]: 1 } }))
    )
  }

  public async updateAsteroids(asteroids: Asteroid[]) {
    const getUpdateOperation = (
      asteroid: Asteroid
    ): BulkWriteUpdateOneOperation<Asteroid> => ({
      updateOne: {
        filter: { id: asteroid.id },
        update: { $set: asteroid },
        upsert: true,
      },
    })
    const writeOperations = asteroids.map(getUpdateOperation)
    await this.collection.bulkWrite(writeOperations)
    return asteroids.length
  }
}

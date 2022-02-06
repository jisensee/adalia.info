open Belt
open ReScriptUrql

module Filter = AsteroidFilters.Filter

let makeFilterVariable = (filters: AsteroidFilters.t) => {
  Queries.DataTableAsteroids.owned: filters.owned->Filter.toOption,
  owners: filters.owners->Filter.toOption,
  scanned: filters.scanned->Filter.toOption,
  spectralTypes: filters.spectralTypes->Filter.toOption,
  sizes: filters.sizes->Filter.toOption,
  rarities: filters.rarities->Filter.toOption,
  radius: filters.radius
  ->Filter.toOption
  ->Option.map(((from, to_)) => {
    Queries.DataTableAsteroids.from: from,
    to_: to_,
  }),
  surfaceArea: filters.surfaceArea
  ->Filter.toOption
  ->Option.map(((from, to_)) => {
    Queries.DataTableAsteroids.from: from,
    to_: to_,
  }),
  orbitalPeriod: filters.orbitalPeriod
  ->Filter.toOption
  ->Option.map(((from, to_)) => {
    Queries.DataTableAsteroids.from: from,
    to_: to_,
  }),
  semiMajorAxis: filters.semiMajorAxis
  ->Filter.toOption
  ->Option.map(((from, to_)) => {
    Queries.DataTableAsteroids.from: from,
    to_: to_,
  }),
  inclination: filters.inclination
  ->Filter.toOption
  ->Option.map(((from, to_)) => {
    Queries.DataTableAsteroids.from: from,
    to_: to_,
  }),
  eccentricity: filters.eccentricity
  ->Filter.toOption
  ->Option.map(((from, to_)) => {
    Queries.DataTableAsteroids.from: from,
    to_: to_,
  }),
  estimatedPrice: filters.estimatedPrice
  ->Filter.toOption
  ->Option.map(((from, to_)) => {
    Queries.DataTableAsteroids.from: from,
    to_: to_,
  }),
  bonuses: filters.bonuses
  ->Filter.toOption
  ->Option.map(bonuses => {
    Queries.DataTableAsteroids.mode: bonuses.mode,
    conditions: bonuses.conditions->Array.map(b =>
      Queries.DataTableAsteroids.makeInputObjectAsteroidBonusConditionInput(
        ~type_=?b.type_,
        ~levels=b.levels,
        (),
      )
    ),
  }),
}
let getGqlSortingField = field =>
  switch field {
  | "id" => #ID
  | "name" => #NAME
  | "owner" => #OWNER
  | "radius" => #RADIUS
  | "surfaceArea" => #SURFACE_AREA
  | "size" => #SIZE
  | "orbitalPeriod" => #ORBITAL_PERIOD
  | "semiMajorAxis" => #SEMI_MAJOR_AXIS
  | "inclination" => #INCLINATION
  | "spectralType" => #SPECTRAL_TYPE
  | "eccentricity" => #ECCENTRICITY
  | "estimatedPrice" => #ESTIMATED_PRICE
  | "rarity" => #RARITY
  | _ => #ID
  }

let getSortingMode = mode =>
  switch mode {
  | QueryParams.SortMode.Ascending => #ASCENDING
  | QueryParams.SortMode.Descending => #DESCENDING
  }

type pageData = {
  pageNum: int,
  pageSize: int,
}

let useAsteroidPageQuery = (
  ~sortData: QueryParams.sortingType,
  ~pageNum,
  ~pageSize,
  ~filters: AsteroidFilters.t,
) => {
  let gqlSortingMode = getSortingMode(sortData.QueryParams.mode)
  let gqlSortingField = getGqlSortingField(sortData.QueryParams.field)
  let ({Hooks.response: response}, _) = Hooks.useQuery(
    ~query=module(Queries.DataTableAsteroids),
    {
      page: {
        num: pageNum,
        size: pageSize,
      },
      sort: {
        field: gqlSortingField,
        mode: gqlSortingMode,
      },
      filter: makeFilterVariable(filters),
    },
  )
  response
}

open Belt
open ReScriptUrql

type pageData = {
  pageNum: int,
  pageSize: int,
}

type filterState = {
  current: AsteroidFilters.t,
  applied: AsteroidFilters.t,
}

let useFilters = defaultFilters =>
  React.useState(() => {
    current: defaultFilters,
    applied: defaultFilters,
  })

let useInitialRouteEffect = (~pageNum, ~pageSize, ~sort, ~appliedFilters, ~columns) =>
  React.useEffect5(() => {
    let initialSortField = AsteroidTableColumn.Id
    switch (pageNum, pageSize, sort) {
    | (Some(_), Some(_), Some(_)) => ()
    | _ =>
      Route.Asteroids({
        pageNum: pageNum->Option.getWithDefault(1)->Some,
        pageSize: pageSize->Option.getWithDefault(15)->Some,
        sort: sort
        ->Option.getWithDefault({
          QueryParams.field: initialSortField->AsteroidTableColumn.toString,
          mode: QueryParams.SortMode.Ascending,
        })
        ->Some,
        filters: Some({
          owned: appliedFilters.AsteroidFilters.owned->AsteroidFilters.Filter.toOption,
          owners: appliedFilters.owners->AsteroidFilters.Filter.toOption,
          scanned: appliedFilters.AsteroidFilters.scanned->AsteroidFilters.Filter.toOption,
          radius: appliedFilters.radius->AsteroidFilters.Filter.toOption,
          spectralTypes: appliedFilters.spectralTypes->AsteroidFilters.Filter.toOption,
          surfaceArea: appliedFilters.surfaceArea->AsteroidFilters.Filter.toOption,
          sizes: appliedFilters.sizes->AsteroidFilters.Filter.toOption,
          orbitalPeriod: appliedFilters.orbitalPeriod->AsteroidFilters.Filter.toOption,
          semiMajorAxis: appliedFilters.semiMajorAxis->AsteroidFilters.Filter.toOption,
          inclination: appliedFilters.inclination->AsteroidFilters.Filter.toOption,
          eccentricity: appliedFilters.eccentricity->AsteroidFilters.Filter.toOption,
          estimatedPrice: appliedFilters.estimatedPrice->AsteroidFilters.Filter.toOption,
          rarities: appliedFilters.rarities->AsteroidFilters.Filter.toOption,
          bonuses: appliedFilters.bonuses->AsteroidFilters.Filter.toOption,
        }),
        columns: Some(columns),
      })
      ->Route.update
      ->ignore
    }
    None
  }, (pageNum, pageSize, sort, appliedFilters, columns->Belt.Array.length))

let useRouteUpdateEffect = (~pageData, ~sortData, ~filters, ~columns) => React.useEffect4(() => {
    let filters = filters->AsteroidFilters.toQueryParamFilter
    Route.Asteroids({
      pageNum: Some(pageData.pageNum),
      pageSize: Some(pageData.pageSize),
      sort: Some(sortData),
      filters: Some(filters),
      columns: Some(columns),
    })
    ->Route.update
    ->ignore
    None
  }, (pageData, sortData, filters, columns->Belt.Array.length))

let usePageData = (~pageNum, ~pageSize) =>
  React.useState(() => {
    pageNum: pageNum,
    pageSize: pageSize,
  })

let makeFilterVariable = (filters: PageQueryParams.AsteroidPageParamType.filters) => {
  Queries.DataTableAsteroids.owned: filters.owned,
  owners: filters.owners,
  scanned: filters.scanned,
  spectralTypes: filters.spectralTypes,
  sizes: filters.sizes,
  rarities: filters.rarities,
  radius: filters.radius->Option.map(((from, to_)) => {
    Queries.DataTableAsteroids.from: from,
    to_: to_,
  }),
  surfaceArea: filters.surfaceArea->Option.map(((from, to_)) => {
    Queries.DataTableAsteroids.from: from,
    to_: to_,
  }),
  orbitalPeriod: filters.orbitalPeriod->Option.map(((from, to_)) => {
    Queries.DataTableAsteroids.from: from,
    to_: to_,
  }),
  semiMajorAxis: filters.semiMajorAxis->Option.map(((from, to_)) => {
    Queries.DataTableAsteroids.from: from,
    to_: to_,
  }),
  inclination: filters.inclination->Option.map(((from, to_)) => {
    Queries.DataTableAsteroids.from: from,
    to_: to_,
  }),
  eccentricity: filters.eccentricity->Option.map(((from, to_)) => {
    Queries.DataTableAsteroids.from: from,
    to_: to_,
  }),
  estimatedPrice: filters.estimatedPrice->Option.map(((from, to_)) => {
    Queries.DataTableAsteroids.from: from,
    to_: to_,
  }),
  bonuses: filters.bonuses->Option.map(bonuses => {
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

let useAsteroidPageQuery = (
  ~sortData: QueryParams.SortingParamType.t,
  ~pageData,
  ~filters: PageQueryParams.AsteroidPageParamType.filters,
) => {
  let gqlSortingMode = getSortingMode(sortData.mode)
  let gqlSortingField = getGqlSortingField(sortData.field)
  let ({Hooks.response: response}, _) = Hooks.useQuery(
    ~query=module(Queries.DataTableAsteroids),
    {
      page: {
        num: pageData.pageNum,
        size: pageData.pageSize,
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

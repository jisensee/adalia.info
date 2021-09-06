open Belt
open AsteroidPageHooks

module Param = PageQueryParams.AsteroidPage
module ParamType = PageQueryParams.AsteroidPageParamType

let pageSizeOptions = [15, 25, 50]

module Table = {
  @react.component
  let make = (
    ~pageNum,
    ~pageSize,
    ~sort: QueryParams.SortingParamType.t,
    ~filters: AsteroidFilters.t,
    ~columns,
    ~actions,
  ) => {
    let (pageData, setPageData) = usePageData(~pageNum, ~pageSize)
    let (sortData, setSortData) = React.useState(() => sort)
    let queryParamFilters = filters->AsteroidFilters.toQueryParamFilter

    useRouteUpdateEffect(~pageData, ~sortData, ~filters, ~columns)

    let response = useAsteroidPageQuery(~sortData, ~pageData, ~filters=queryParamFilters)

    let onPageChange = (newPageSize: DataTable.pageSize, newPageNum: DataTable.pageNum) => {
      setPageData(_ => {
        pageNum: newPageNum,
        pageSize: newPageSize,
      })
    }

    let onSort = (column: DataTable.column, direction) => {
      let mode = switch direction {
      | #asc => QueryParams.SortMode.Ascending
      | #desc => QueryParams.SortMode.Descending
      }
      let newSortData = {QueryParams.field: column->DataTable.idGet, mode: mode}
      setSortData(_ => newSortData)
    }

    switch response {
    | Data({asteroids}) =>
      <AsteroidTable
        pageData=asteroids
        actions
        defaultSortFieldId=sort.field
        pageSize=pageData.pageSize
        columns
        pageSizeOptions
        onPageChange
        onSort
      />
    | Fetching => <AsteroidTable.Loading columns />
    | _ => React.null
    }
  }
}

let getDefaultFilter = (filters, {Queries.PriceBounds.min: minPrice, max: maxPrice}) => {
  let getDefault = (getter, default) => {
    let filter = filters->Option.flatMap(getter)
    {
      AsteroidFilters.Filter.active: filter->Option.isSome,
      value: filter->Option.getWithDefault(default),
    }
  }
  {
    AsteroidFilters.owned: getDefault(f => f.ParamType.owned, true),
    scanned: getDefault(f => f.ParamType.scanned, true),
    spectralTypes: getDefault(f => f.spectralTypes, []),
    radius: getDefault(f => f.radius, Defaults.radiusBounds),
    surfaceArea: getDefault(f => f.surfaceArea, Defaults.surfaceBounds),
    sizes: getDefault(f => f.sizes, []),
    orbitalPeriod: getDefault(f => f.orbitalPeriod, Defaults.orbitalPeriodBounds),
    semiMajorAxis: getDefault(f => f.semiMajorAxis, Defaults.semiMajorAxisBounds),
    inclination: getDefault(f => f.inclination, Defaults.inclinationBounds),
    eccentricity: getDefault(f => f.eccentricity, Defaults.eccentricityBounds),
    estimatedPrice: getDefault(f => f.estimatedPrice, (minPrice, maxPrice)),
    rarities: getDefault(f => f.rarities, []),
    bonuses: getDefault(f => f.bonuses, {AsteroidBonusFilter.mode: #AND, conditions: []}),
  }
}

let defaultCols = [
  AsteroidTableColumn.Owner,
  Name,
  SpectralType,
  Size,
  SurfaceArea,
  OrbitalPeriod,
  EstimatedPrice,
  Rarity,
]
let allCols = [
  AsteroidTableColumn.Owner,
  Name,
  SpectralType,
  Size,
  Rarity,
  SurfaceArea,
  Radius,
  OrbitalPeriod,
  SemiMajorAxis,
  Inclination,
  Eccentricity,
  EstimatedPrice,
  Scanned,
]

@react.component
let make = (~pageNum=?, ~pageSize=?, ~sort=?, ~filters=?, ~columns=?) => {
  let priceBounds = PriceBounds.Context.use()
  let defaultFilters = getDefaultFilter(
    filters,
    priceBounds->Option.getWithDefault({Queries.PriceBounds.min: 0.0, max: 0.0}),
  )
  let filteredPageSize = pageSize->Option.keep(Js.Array2.includes(pageSizeOptions))

  let (filters, setFilters) = useFilters(defaultFilters)
  React.useEffect1(() => {
    setFilters(_ => {applied: defaultFilters, current: defaultFilters})
    None
  }, [priceBounds])

  let makeColumnMap = active => allCols->Array.map(c => (c, active->Array.some(a => a === c)))
  let (selectedColumns, setSelectedColumns) = React.useState(_ =>
    switch columns {
    | None => defaultCols->makeColumnMap
    | Some(selected) => selected->makeColumnMap
    }
  )
  let activeCols = selectedColumns->Array.keepMap(((key, active)) =>
    switch active {
    | true => Some(key)
    | false => None
    }
  )

  useInitialRouteEffect(
    ~pageNum,
    ~pageSize,
    ~sort,
    ~appliedFilters=filters.applied,
    ~columns=activeCols,
  )

  switch (pageNum, filteredPageSize, sort, columns) {
  | (Some(p), Some(ps), Some(s), Some(_)) => {
      let onFilterChange = newFilters => setFilters(_ => {...filters, current: newFilters})
      let onFilterApply = () => {
        let correctedFilter = filters.current->AsteroidFilters.correctFilter
        setFilters(_ => {current: correctedFilter, applied: correctedFilter})
      }
      let onReset = () =>
        setFilters(_ => {
          current: filters.current->AsteroidFilters.disableAll,
          applied: filters.applied->AsteroidFilters.disableAll,
        })

      let columnConfig =
        <AsteroidTableColumnConfig
          columns=selectedColumns
          onChange={c => setSelectedColumns(_ => c)}
          columnToString={AsteroidTableColumn.toName}
        />
      module Popover = Common.Popover
      let actions =
        <div className="z-20 text-lg">
          <Popover className="relative">
            <Popover.Button className="">
              <Icon kind={Icon.Fas("list")} breakpoint={Icon.Sm}> {"Columns"->React.string} </Icon>
            </Popover.Button>
            <Common.Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0">
              <Popover.Panel className="absolute z-50 mt-3 w-48 -right-0">
                {columnConfig}
              </Popover.Panel>
            </Common.Transition>
          </Popover>
        </div>

      <div className="flex flex-col h-full">
        <h1> {"Asteroids"->React.string} </h1>
        <p>
          {"You can apply filters to all asteroids by expanding the filter widget. Copy the URL to share your current filter and sorting setup."->React.string}
        </p>
        <p>
          <span className="text-cyan font-bold"> {"Disclaimer: "->React.string} </span>
          {"The shown prices are calculated of a base price provided by the Influence team. Therefore they might be out of sync if the team decides to readjust the pricing due to high volatility."->React.string}
        </p>
        <div className="flex flex-row mb-3">
          <AsteroidFilters
            className="flex flex-grow"
            filters=filters.current
            onChange=onFilterChange
            onApply=onFilterApply
            onReset
          />
        </div>
        <Table actions pageNum=p pageSize=ps sort=s filters=filters.applied columns=activeCols />
      </div>
    }
  | _ => React.null
  }
}

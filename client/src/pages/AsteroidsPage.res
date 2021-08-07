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
  ) => {
    let (pageData, setPageData) = usePageData(~pageNum, ~pageSize)
    let (sortData, setSortData) = React.useState(() => sort)
    let queryParamFilters = filters->AsteroidFilters.toQueryParamFilter

    useRouteUpdateEffect(~pageData, ~sortData, ~filters)

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
        defaultSortFieldId=sort.field
        pageSize=pageData.pageSize
        pageSizeOptions
        onPageChange
        onSort
      />
    | Fetching => <AsteroidTable.Loading />
    | _ => React.null
    }
  }
}

let getDefaultFilter = filters => {
  let getDefault = (getter, default) => {
    let filter = filters->Option.flatMap(getter)
    {
      AsteroidFilters.Filter.active: filter->Option.isSome,
      value: filter->Option.getWithDefault(default),
    }
  }
  {
    AsteroidFilters.owned: getDefault(f => f.ParamType.owned, true),
    spectralTypes: getDefault(f => f.spectralTypes, []),
    radius: getDefault(f => f.radius, (100, 900)),
    surfaceArea: getDefault(f => f.surfaceArea, (200, 20000)),
    orbitalPeriod: getDefault(f => f.orbitalPeriod, (700, 3000)),
    semiMajorAxis: getDefault(f => f.semiMajorAxis, (0, 50)),
    inclination: getDefault(f => f.inclination, (0, 20)),
  }
}

@react.component
let make = (~pageNum=?, ~pageSize=?, ~sort=?, ~filters=?) => {
  let defaultFilters = getDefaultFilter(filters)
  let filteredPageSize = pageSize->Option.keep(Js.Array2.includes(pageSizeOptions))

  let (filters, setFilters) = useFilters(defaultFilters)

  useInitialRouteEffect(~pageNum, ~pageSize, ~sort, ~appliedFilters=filters.applied)

  switch (pageNum, filteredPageSize, sort) {
  | (Some(p), Some(ps), Some(s)) => {
      let onFilterChange = newFilters => setFilters(_ => {...filters, current: newFilters})
      let onFilterApply = () => {
        let correctedFilter = filters.current->AsteroidFilters.correctFilter
        setFilters(_ => {current: correctedFilter, applied: correctedFilter})
      }

      <div className="flex flex-col h-full">
        <h1> {"Asteroids"->React.string} </h1>
        <p>
          {"You can apply filters to all asteroids by expanding the filter widget. Copy the URL to share your current filter and sorting setup."->React.string}
        </p>
        <AsteroidFilters
          className="mb-4" filters=filters.current onChange=onFilterChange onApply=onFilterApply
        />
        <Table pageNum=p pageSize=ps sort=s filters=filters.applied />
      </div>
    }
  | _ => React.null
  }
}

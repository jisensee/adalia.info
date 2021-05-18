open Belt
open ReScriptUrql

type pageData = {
  pageNum: int,
  pageSize: int,
}

module Param = Route.AsteroidPageParam

module Table = {
  @react.component
  let make = (
    ~pageNum,
    ~pageSize,
    ~pageSizeOptions,
    ~sort: QueryParams.Sort.t,
    ~filter: AsteroidFilters.t,
  ) => {
    let (pageData, setPageData) = React.useState(() => {
      pageNum: pageNum,
      pageSize: pageSize,
    })
    let (sortData, setSortData) = React.useState(() => sort)
    let ownedFilter = filter.owned->AsteroidFilters.Filter.toOption
    let spectralTypesFilter = filter.spectralTypes->AsteroidFilters.Filter.toOption

    React.useEffect3(() => {
      Route.Asteroids({
        pageNum: pageData.pageNum->Some,
        pageSize: pageData.pageSize->Some,
        sort: sortData->Some,
        owned: ownedFilter,
      })
      ->Route.update
      ->ignore
      None
    }, (pageData, sortData, ownedFilter))

    let gqlSortingMode = switch sortData.mode {
    | QueryParams.SortMode.Ascending => #ASCENDING
    | QueryParams.SortMode.Descending => #DESCENDING
    }
    let gqlSortingField = switch sortData.field {
    | "id" => #ID
    | "name" => #NAME
    | "owner" => #OWNER
    | "radius" => #RADIUS
    | "surfaceArea" => #SURFACE_AREA
    | "orbitalPeriod" => #ORBITAL_PERIOD
    | "semiMajorAxis" => #SEMI_MAJOR_AXIS
    | "inclination" => #INCLINATION
    | "spectralType" => #SPECTRAL_TYPE
    | _ => #ID
    }
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
        filter: {
          owned: ownedFilter,
          spectralTypes: spectralTypesFilter,
        },
      },
    )

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
      let newSortData = {QueryParams.Sort.field: column->DataTable.idGet, mode: mode}
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

@react.component
let make = (~pageNum=?, ~pageSize=?, ~sort=?, ~owned=?) => {
  let pageSizeOptions = [15, 25, 50]
  let filteredPageSize = pageSize->Option.keep(Js.Array2.includes(pageSizeOptions))
  let initialSortField: AsteroidTable.Column.id = #id

  let (filter, setFilter) = React.useState(() => {
    AsteroidFilters.owned: {
      active: owned->Option.isSome,
      value: owned->Option.getWithDefault(true),
    },
    spectralTypes: {
      active: false,
      value: [],
    },
  })

  React.useEffect4(() => {
    switch (pageNum, filteredPageSize, sort) {
    | (Some(_), Some(_), Some(_)) => ()
    | _ =>
      Route.Asteroids({
        pageNum: pageNum->Option.getWithDefault(1)->Some,
        pageSize: filteredPageSize->Option.getWithDefault(15)->Some,
        sort: sort
        ->Option.getWithDefault({
          QueryParams.Sort.field: (initialSortField :> string),
          mode: QueryParams.SortMode.Ascending,
        })
        ->Some,
        owned: filter.owned->AsteroidFilters.Filter.toOption,
      })
      ->Route.update
      ->ignore
    }
    None
  }, (pageNum, pageSize, sort, filter))

  switch (pageNum, filteredPageSize, sort) {
  | (Some(p), Some(ps), Some(s)) => {
      let onFilterChange = newFilter => setFilter(_ => newFilter)

      <div className="flex flex-col h-full">
        <h1> {"Asteroids"->React.string} </h1>
        <p>
          {"You can apply filters to all asteroids by expanding the filter widget. You can share you current filter and sorting setup simply by copying the URL."->React.string}
        </p>
        <AsteroidFilters className="mb-4" filter onChange=onFilterChange />
        <Table pageNum=p pageSize=ps pageSizeOptions sort=s filter />
      </div>
    }
  | _ => React.null
  }
}

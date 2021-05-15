open Belt
open ReScriptUrql

type pageData = {
  pageNum: int,
  pageSize: int,
}

module Param = Route.AsteroidPageParam

module Table = {
  @react.component
  let make = (~pageNum, ~pageSize, ~pageSizeOptions, ~sort: QueryParams.Sort.t) => {
    let (pageData, setPageData) = React.useState(() => {
      pageNum: pageNum,
      pageSize: pageSize,
    })
    let (sortData, setSortData) = React.useState(() => sort)

    React.useEffect2(() => {
      Route.Asteroids({
        pageNum: pageData.pageNum->Some,
        pageSize: pageData.pageSize->Some,
        sort: sortData->Some,
      })
      ->Route.update
      ->ignore
      None
    }, (pageData, sortData))

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
let make = (~pageNum=?, ~pageSize=?, ~sort=?) => {
  let pageSizeOptions = [15, 25, 50]
  let filteredPageSize = pageSize->Option.keep(Js.Array2.includes(pageSizeOptions))
  let initialSortField: AsteroidTable.Column.id = #id
  React.useEffect3(() => {
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
      })
      ->Route.update
      ->ignore
    }
    None
  }, (pageNum, pageSize, sort))

  switch (pageNum, filteredPageSize, sort) {
  | (Some(p), Some(ps), Some(s)) =>
    <div className="flex flex-col h-full">
      <h1> {"Asteroids"->React.string} </h1> <Table pageNum=p pageSize=ps pageSizeOptions sort=s />
    </div>
  | _ => React.null
  }
}

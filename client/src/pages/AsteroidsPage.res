open Belt
open ReScriptUrql

type pageData = {
  currentPage: int,
  currentPageSize: int,
}

module Table = {
  open Route.AsteroidPageParamType
  @react.component
  let make = (~page, ~pageSize, ~pageSizeOptions, ~sort: Sort.t) => {
    let (firstRender, setFirstRender) = React.useState(() => true)
    let (pageData, setPageData) = React.useState(() => {
      currentPage: page,
      currentPageSize: pageSize,
    })
    let (sortData, setSortData) = React.useState(() => sort)

    React.useEffect0(() => {
      setFirstRender(_ => false)
      None
    })

    React.useEffect2(() => {
      Route.Asteroids({
        page: pageData.currentPage->Some,
        pageSize: pageData.currentPageSize->Some,
        sort: sortData->Some,
      })
      ->Route.update
      ->ignore
      None
    }, (pageData, sortData))

    let gqlSortingMode = switch sortData.mode {
    | SortMode.Ascending => #ASCENDING
    | SortMode.Descending => #DESCENDING
    }
    let gqlSortingField = switch sortData.by {
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
          num: pageData.currentPage,
          size: pageData.currentPageSize,
        },
        sort: {
          field: gqlSortingField,
          mode: gqlSortingMode,
        },
      },
    )

    let onChange = (newPageSize: DataTable.rowsPerPage, newPage: DataTable.page) => {
      setPageData(_ => {
        currentPage: newPage,
        currentPageSize: newPageSize,
      })
    }

    let onSort = (column: DataTable.column, direction) => {
      let mode = switch direction {
      | #asc => SortMode.Ascending
      | #desc => SortMode.Descending
      }
      let newSortData = {Sort.by: column->DataTable.idGet, mode: mode}
      setSortData(_ => newSortData)
    }

    let defaultSortFieldId = switch firstRender {
    | true => Some(sortData.by)
    | false => Some(sortData.by)
    }

    switch response {
    | Data({asteroids}) =>
      <AsteroidTable
        pageData=asteroids
        ?defaultSortFieldId
        currentPage=pageData.currentPage
        currentPageSize=pageData.currentPageSize
        pageSizeOptions
        onChange
        onSort
      />
    | _ => React.null
    }
  }
}

@react.component
let make = (~page=?, ~pageSize=?, ~sort=?) => {
  open Route.AsteroidPageParamType
  let pageSizeOptions = [15, 25, 50]
  let filteredPageSize = pageSize->Option.keep(Js.Array2.includes(pageSizeOptions))
  React.useEffect3(() => {
    switch (page, filteredPageSize, sort) {
    | (Some(_), Some(_), Some(_)) => ()
    | _ =>
      Route.Asteroids({
        page: page->Option.getWithDefault(1)->Some,
        pageSize: filteredPageSize->Option.getWithDefault(15)->Some,
        sort: sort->Option.getWithDefault({Sort.by: "id", mode: SortMode.Ascending})->Some,
      })
      ->Route.update
      ->ignore
    }
    None
  }, (page, pageSize, sort))

  switch (page, filteredPageSize, sort) {
  | (Some(p), Some(ps), Some(s)) =>
    <div className="flex flex-col h-full">
      <h1> {"Asteroids"->React.string} </h1> <Table page=p pageSize=ps pageSizeOptions sort=s />
    </div>
  | _ => React.null
  }
}

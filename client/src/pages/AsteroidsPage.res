open Belt
open ReScriptUrql

type pageData = {
  currentPage: int,
  currentPageSize: int,
}

module Table = {
  @react.component
  let make = (~page, ~pageSize, ~pageSizeOptions) => {
    let (pageData, setPageData) = React.useState(() => {
      currentPage: page,
      currentPageSize: pageSize,
    })

    let ({Hooks.response: response}, _) = Hooks.useQuery(
      ~query=module(Queries.DataTableAsteroids),
      {
        page: {
          num: pageData.currentPage,
          size: pageData.currentPageSize,
        },
      },
    )

    let onChange = (newPageSize: DataTable.rowsPerPage, newPage: DataTable.page) => {
      Route.Asteroids({
        page: Some(newPage),
        pageSize: Some(newPageSize),
      })
      ->Route.go
      ->ignore
      setPageData(_ => {
        currentPage: newPage,
        currentPageSize: newPageSize,
      })
    }

    switch response {
    | Data({asteroids}) =>
      <AsteroidTable
        pageData=asteroids
        currentPage=pageData.currentPage
        currentPageSize=pageData.currentPageSize
        pageSizeOptions
        onChange
      />
    | _ => React.null
    }
  }
}

@react.component
let make = (~page=?, ~pageSize=?) => {
  let pageSizeOptions = [15, 25, 50]
  React.useEffect0(() => {
    Route.Asteroids({
      page: page->Option.getWithDefault(1)->Some,
      pageSize: pageSize->Option.getWithDefault(15)->Some,
    })
    ->Route.go
    ->ignore
    None
  })

  switch (page, pageSize) {
  | (Some(p), Some(ps)) =>
    <div className="flex flex-col h-full">
      <h1> {"Asteroids"->React.string} </h1> <Table page=p pageSize=ps pageSizeOptions />
    </div>
  | _ => React.null
  }
}

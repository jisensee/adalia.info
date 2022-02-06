open Belt
open AsteroidPageHooks

module Params = AsteroidPageQueryParams

let pageSizeOptions = [15, 25, 50]

module Table = {
  @react.component
  let make = (~tableParams, ~filters: AsteroidFilters.t, ~actions, ~onAsteroidCountChange) => {
    let response = useAsteroidPageQuery(
      ~sortData=tableParams.Params.sort,
      ~pageNum=tableParams.pageNum,
      ~pageSize=tableParams.pageSize,
      ~filters,
    )

    React.useEffect1(() => {
      switch response {
      | Data({asteroids}) => onAsteroidCountChange(asteroids.totalRows)
      | _ => ()
      }
      None
    }, [response])

    let onPageChange = (newPageSize: DataTable.pageSize, newPageNum: DataTable.pageNum) => {
      tableParams.Params.setPageNum(newPageNum, #replaceIn)
      tableParams.Params.setPageSize(newPageSize, #replaceIn)
    }

    let onSort = (column: DataTable.column, direction) => {
      let mode = switch direction {
      | #asc => QueryParams.SortMode.Ascending
      | #desc => QueryParams.SortMode.Descending
      }
      let newSortData = {QueryParams.field: column->DataTable.idGet, mode: mode}
      tableParams.Params.setSort(newSortData, #replaceIn)
    }

    switch response {
    | Data({asteroids}) =>
      <AsteroidTable
        pageData=asteroids
        actions
        defaultSortFieldId=tableParams.Params.sort.field
        pageSize=tableParams.Params.pageSize
        columns=tableParams.Params.columns
        pageSizeOptions
        onPageChange
        onSort
      />
    | Fetching => <AsteroidTable.Loading columns=tableParams.columns />
    | _ => React.null
    }
  }
}

@react.component
let make = () => {
  let tableParams = AsteroidPageQueryParams.use()
  AsteroidFiltersQueryParams.use()
  let {filters: storeFilters} = AsteroidFilters.Store.use()

  let makeColumnMap = active =>
    AsteroidTableColumn.allCols->Array.map(c => (c, active->Array.some(a => a === c)))
  let columns = tableParams.columns->makeColumnMap

  let (exportDialogOpen, setExportDialogOpen) = React.useState(() => false)
  let (asteroidCount, setAsteroidCount) = React.useState(() => 0)

  let onColumnsChange = newColumnMap =>
    newColumnMap
    ->Array.keepMap(((col, active)) =>
      switch active {
      | true => Some(col)
      | false => None
      }
    )
    ->tableParams.setColumns(#replaceIn)

  React.useEffect1(() => {
    if !Js.Array2.includes(pageSizeOptions, tableParams.pageSize) {
      tableParams.setPageSize(15, #replaceIn)
    }
    None
  }, [tableParams.pageSize])

  let columnConfig =
    <AsteroidTableColumnConfig
      columns onChange={onColumnsChange} columnToString={AsteroidTableColumn.toName}
    />
  module Popover = Common.Popover
  let actions =
    <div className="flex flex-row space-x-3 text-lg">
      <AsteroidQuickFilters />
      <Vechai.Button
        className="btn-inverted" size={#lg} onClick={_ => setExportDialogOpen(_ => true)}>
        <Icon kind={Icon.Fas("file-export")} breakpoint={Icon.Md} text="Export" />
      </Vechai.Button>
      <div className="z-20">
        <Popover className="relative">
          <Popover.Button _as={React.Fragment.make}>
            <Vechai.Button className="btn-inverted" size={#lg}>
              <Icon kind={Icon.Fas("list")} breakpoint={Icon.Md} text="Columns" />
            </Vechai.Button>
          </Popover.Button>
          <Common.Transitions.Appear>
            <Popover.Panel className="absolute z-50 mt-3 w-48 -right-2 bg-base">
              {columnConfig}
            </Popover.Panel>
          </Common.Transitions.Appear>
        </Popover>
      </div>
    </div>

  <div className="flex flex-col">
    <AsteroidExportDialog
      isOpen=exportDialogOpen
      onOpenChange={o => setExportDialogOpen(_ => o)}
      filters=storeFilters
      sorting=tableParams.sort
      asteroidCount
    />
    <h1> {"Asteroids"->React.string} </h1>
    <p>
      {"Select your filters in the sidebar and copy the URL to share your current filter and sorting setup."->React.string}
    </p>
    <div className="flex flex-col space-y-3 mb-3">
      <AsteroidFiltersSummary />
      {tableParams.columns
      ->Array.getBy(c => c == AsteroidTableColumn.EstimatedPrice)
      ->Option.mapWithDefault(React.null, _ =>
        <span>
          <span className="text-primary-std font-bold"> {"Disclaimer: "->React.string} </span>
          {"The shown prices were the prices from the last sale and are only provided as reference and are not intended to be a meaningful representation of an asteroids value."->React.string}
        </span>
      )}
    </div>
    <Table
      actions tableParams filters=storeFilters onAsteroidCountChange={c => setAsteroidCount(_ => c)}
    />
  </div>
}

module CellRenderer = {
  type index = int
  type id = string
  type column = {
    id: string,
    index: int,
  }
  type row = Js.Dict.t<string>
  type t = (row, index, column, id) => React.element

  let make = (valueKey: string, render): t =>
    (row, _, _, id) =>
      row->Js.Dict.get(valueKey)->Belt.Option.mapWithDefault(id->React.string, render)
}

type data = array<Js.Dict.t<string>>
type pageSize = int
type pageNum = int

type sortDirection = [#asc | #desc]

@deriving(abstract)
type column = {
  id: string,
  name: string,
  selector: Js.Dict.t<string> => option<string>,
  @optional cell: CellRenderer.t,
  @optional sortable: bool,
}

module Binding = {
  @module("react-data-table-component") @react.component
  external make: (
    ~columns: array<column>,
    ~data: data=?,
    ~noHeader: bool=?,
    ~progressPending: bool=?,
    ~progressComponent: React.element=?,
    ~persistTableHead: bool=?,
    ~pagination: bool=?,
    ~paginationServer: bool=?,
    ~paginationTotalRows: int=?,
    ~paginationPerPage: int=?,
    ~paginationRowsPerPageOptions: array<int>=?,
    ~paginationDefaultPage: int=?,
    ~onChangeRowsPerPage: (pageSize, pageNum) => unit=?,
    ~onChangePage: pageNum => unit=?,
    ~fixedHeader: bool=?,
    ~fixedHeaderScrollHeight: string=?,
    ~paginationIconFirstPage: React.element=?,
    ~paginationIconLastPage: React.element=?,
    ~paginationIconNext: React.element=?,
    ~paginationIconPrevious: React.element=?,
    ~defaultSortFieldId: string=?,
    ~onSort: (column, sortDirection) => unit=?,
    ~sortServer: bool=?,
    ~sortFunction: (data, string, sortDirection) => data=?,
  ) => React.element = "default"
}

type pagination = {
  server: bool,
  totalRows: int,
  pageSize: int,
  pageSizeOptions: array<int>,
  onChange: (pageSize, pageNum) => unit,
}

type sorting = {
  server: bool,
  onChange: (column, sortDirection) => unit,
  defaultSortFieldId: string,
}

type header = {
  fixed: bool,
  scrollHeight: string,
}

module Loading = {
  @react.component
  let make = (~columns, ~text) =>
    <Binding
      columns
      progressPending={true}
      persistTableHead={true}
      progressComponent={<div className="datatable-loading w-full py-4">
        <Common.LoadingSpinner text className="" />
      </div>}
    />
}

@react.component
let make = (~columns, ~data, ~pagination=?, ~sorting=?, ~header=?) => {
  let (
    usePagination,
    paginationServer,
    paginationTotalRows,
    paginationPerPage,
    paginationRowsPerPageOptions,
    onChangeRowsPerPage,
    onChangePage,
  ) = switch pagination {
  | None => (false, None, None, None, None, None, None)
  | Some(p: pagination) => (
      true,
      p.server->Some,
      p.totalRows->Some,
      p.pageSize->Some,
      p.pageSizeOptions->Some,
      p.onChange->Some,
      Some(newPage => p.onChange(p.pageSize, newPage)),
    )
  }

  let (sortServer, onSort, defaultSortFieldId) = switch sorting {
  | None => (None, None, None)
  | Some(s) => (s.server->Some, s.onChange->Some, s.defaultSortFieldId->Some)
  }

  let (fixedHeader, fixedHeaderScrollHeight) = switch header {
  | None => (None, None)
  | Some(h) => (h.fixed->Some, h.scrollHeight->Some)
  }
  <Binding
    columns
    data
    sortFunction={(data, _, _) => Js.Array2.copy(data)}
    noHeader={true}
    ?fixedHeader
    ?fixedHeaderScrollHeight
    ?sortServer
    ?onSort
    ?defaultSortFieldId
    pagination=usePagination
    ?paginationServer
    ?paginationRowsPerPageOptions
    ?paginationPerPage
    ?paginationTotalRows
    ?onChangePage
    ?onChangeRowsPerPage
    paginationIconNext={<Icon kind={Icon.Fas("forward")} />}
    paginationIconPrevious={<Icon kind={Icon.Fas("backward")} />}
    paginationIconFirstPage={<Icon kind={Icon.Fas("step-backward")} />}
    paginationIconLastPage={<Icon kind={Icon.Fas("step-forward")} />}
  />
}

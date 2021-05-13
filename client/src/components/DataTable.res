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
type rowsPerPage = int
type page = int

@deriving(abstract)
type column = {
  name: string,
  selector: Js.Dict.t<string> => option<string>,
  @optional @as("cell") cellRenderer: CellRenderer.t,
  @optional sortable: bool,
}

module Binding = {
  @module("react-data-table-component") @react.component
  external make: (
    ~columns: array<column>,
    ~data: data=?,
    ~noHeader: bool=?,
    ~pagination: bool=?,
    ~paginationServer: bool=?,
    ~paginationTotalRows: int=?,
    ~paginationPerPage: int=?,
    ~paginationRowsPerPageOptions: array<int>=?,
    ~paginationDefaultPage: int=?,
    ~onChangeRowsPerPage: (rowsPerPage, page) => unit=?,
    ~onChangePage: page => unit=?,
    ~fixedHeader: bool=?,
    ~fixedHeaderScrollHeight: string=?,
    ~paginationIconFirstPage: React.element=?,
    ~paginationIconLastPage: React.element=?,
    ~paginationIconNext: React.element=?,
    ~paginationIconPrevious: React.element=?,
  ) => React.element = "default"
}

module WithPagination = {
  @react.component
  let make = (
    ~columns,
    ~data,
    ~totalRows,
    ~currentPage,
    ~currentPageSize,
    ~pageSizeOptions,
    ~onChange,
  ) => {
    <Binding
      columns
      data
      noHeader={true}
      fixedHeader={true}
      pagination={true}
      paginationServer={true}
      paginationRowsPerPageOptions=pageSizeOptions
      paginationDefaultPage=currentPage
      paginationPerPage=currentPageSize
      paginationTotalRows=totalRows
      onChangePage={newPage => onChange(currentPageSize, newPage)}
      onChangeRowsPerPage=onChange
      paginationIconNext={<Icon kind={Icon.Fas("forward")} />}
      paginationIconPrevious={<Icon kind={Icon.Fas("backward")} />}
      paginationIconFirstPage={<Icon kind={Icon.Fas("step-backward")} />}
      paginationIconLastPage={<Icon kind={Icon.Fas("step-forward")} />}
    />
  }
}

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

@deriving(abstract)
type column = {
  name: string,
  selector: string,
  @optional @as("cell") cellRenderer: CellRenderer.t,
  @optional sortable: bool,
}

@module("react-data-table-component") @react.component
external make: (~columns: array<column>, ~data: data, ~noHeader: bool) => React.element = "default"
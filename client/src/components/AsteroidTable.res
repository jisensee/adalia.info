open Belt

@react.component
let make = (
  ~pageData: Fragments.DataTableAsteroidPage.t,
  ~currentPage,
  ~currentPageSize,
  ~pageSizeOptions,
  ~onChange,
) => {
  let ownerCell = DataTable.CellRenderer.make("owner", address => <AsteroidOwner address />)
  let columns = [
    DataTable.column(~name="ID", ~selector=Js.Dict.get(_, "id"), ()),
    DataTable.column(~name="Name", ~selector=Js.Dict.get(_, "name"), ()),
    DataTable.column(~name="Owner", ~selector=Js.Dict.get(_, "owner"), ~cellRenderer=ownerCell, ()),
  ]
  let data =
    pageData.rows
    ->Belt.Array.map(a => [
      ("id", a.id),
      ("name", a.name),
      ("owner", a.owner->Option.getWithDefault("")),
    ])
    ->Belt.Array.map(Js.Dict.fromArray)
  <DataTable.WithPagination
    columns data totalRows={pageData.totalRows} currentPage currentPageSize pageSizeOptions onChange
  />
}

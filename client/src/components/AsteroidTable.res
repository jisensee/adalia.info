open Belt

@react.component
let make = (~asteroids: array<Fragments.DataTableAsteroid.t>) => {
  let data =
    asteroids
    ->Belt.Array.map(a => [
      ("id", a.id),
      ("name", a.name),
      ("owner", a.owner->Option.getWithDefault("")),
    ])
    ->Belt.Array.map(Js.Dict.fromArray)

  let ownerCell = DataTable.CellRenderer.make("owner", address => <AsteroidOwner address />)
  let columns = [
    DataTable.column(~name="ID", ~selector=Js.Dict.get(_,"id"), ~sortable=true, ()),
    DataTable.column(~name="Name", ~selector=Js.Dict.get(_,"name"), ()),
    DataTable.column(~name="Owner", ~selector=Js.Dict.get(_,"owner"), ~cellRenderer=ownerCell, ()),
  ]

  <DataTable noHeader=true columns data />
}

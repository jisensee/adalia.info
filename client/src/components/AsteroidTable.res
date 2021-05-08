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
    DataTable.column(~name="ID", ~selector="id", ~sortable=true, ()),
    DataTable.column(~name="Name", ~selector="name", ()),
    DataTable.column(~name="Owner", ~selector="owner", ~cellRenderer=ownerCell, ()),
  ]

  <DataTable noHeader=true columns data />
}

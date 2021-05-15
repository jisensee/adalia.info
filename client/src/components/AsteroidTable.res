external spectralTypeToStr: Fragments.DataTableAsteroid.t_spectralType => string = "%identity"

module Column = {
  type id = [
    | #id
    | #owner
    | #name
    | #radius
    | #surfaceArea
    | #orbitalPeriod
    | #semiMajorAxis
    | #inclination
    | #spectralType
  ]
  let toName = id =>
    switch id {
    | #id => "ID"
    | #owner => "Owner"
    | #name => "Name"
    | #radius => "Radius"
    | #surfaceArea => "Surface area"
    | #orbitalPeriod => "Orbital period"
    | #semiMajorAxis => "Semi major axis"
    | #inclination => "Inclination"
    | #spectralType => "Spectral type"
    }
  let make = (id: id) =>
    DataTable.column(
      ~id=(id :> string),
      ~name=id->toName,
      ~selector=Js.Dict.get(_, (id :> string)),
      ~sortable=true,
    )
}

let ownerCell = DataTable.CellRenderer.make("owner", address => <AsteroidOwner address />)
let columns = [
  Column.make(#id, ()),
  Column.make(#owner, ~cell=ownerCell, ()),
  Column.make(#name, ()),
  Column.make(#radius, ()),
  Column.make(#surfaceArea, ()),
  Column.make(#orbitalPeriod, ()),
  Column.make(#semiMajorAxis, ()),
  Column.make(#inclination, ()),
  Column.make(#spectralType, ()),
]

let cell = (id: Column.id, value: 'a, formatValue: 'a => string) => (
  (id :> string),
  value->formatValue,
)

module Loading = {
  @react.component
  let make = () => <DataTable.Loading columns text={"Loading asteroids..."} />
}

@react.component
let make = (
  ~pageData: Fragments.DataTableAsteroidPage.t,
  ~pageSize,
  ~pageSizeOptions,
  ~defaultSortFieldId,
  ~onPageChange,
  ~onSort,
) => {
  open Belt
  let data =
    pageData.rows
    ->Array.map(a => [
      cell(#id, a.id, Int.toString),
      cell(#name, a.name, s => s),
      cell(#owner, a.owner, Option.getWithDefault(_, "")),
      cell(#radius, a.radius, Float.toString),
      cell(#surfaceArea, a.surfaceArea, Float.toString),
      cell(#orbitalPeriod, a.orbitalPeriod, Int.toString),
      cell(#semiMajorAxis, a.semiMajorAxis, Float.toString),
      cell(#inclination, a.inclination, Float.toString),
      cell(#spectralType, a.spectralType, spectralTypeToStr),
    ])
    ->Array.map(Js.Dict.fromArray)
  let pagination: DataTable.pagination = {
    server: true,
    pageSize: pageSize,
    pageSizeOptions: pageSizeOptions,
    onChange: onPageChange,
    totalRows: pageData.totalRows,
  }
  let sorting: DataTable.sorting = {
    server: true,
    defaultSortFieldId: defaultSortFieldId,
    onChange: onSort,
  }
  <DataTable columns data pagination sorting />
}

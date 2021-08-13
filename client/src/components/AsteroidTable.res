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
    | #eccentricity
  ]
  let toName = id =>
    switch id {
    | #id => "ID"
    | #owner => "Owner"
    | #name => "Name"
    | #radius => "Radius"
    | #surfaceArea => "Surface"
    | #orbitalPeriod => "OP"
    | #semiMajorAxis => "SMA"
    | #inclination => "Incl."
    | #spectralType => "Type"
    | #eccentricity => "Ecc."
    }
  let make = (id: id) =>
    DataTable.column(
      ~id=(id :> string),
      ~name=id->toName,
      ~selector=Js.Dict.get(_, (id :> string)),
      ~sortable=true,
    )
}

let idCell = DataTable.CellRenderer.make("id", id =>
  <div className="flex flex-row space-x-5 items-center">
    <Link to_={Link.makeGameRoidLink(id)}>
      <Icon imageClassName="h-5" kind=Icon.Custom("influence.svg") />
    </Link>
    <Link to_=Link.Internal(Route.Asteroid(id)) className="font-bold"> {id->React.string} </Link>
  </div>
)
let ownerCell = DataTable.CellRenderer.make("owner", address =>
  <AsteroidOwner address shortAddress={true} />
)
let columns = [
  Column.make(#id, ~grow=5, ~cell=idCell, ()),
  Column.make(#owner, ~grow=5, ~cell=ownerCell, ()),
  Column.make(#name, ~grow=8, ()),
  Column.make(#spectralType, ~grow=2, ()),
  Column.make(#radius, ~grow=5, ()),
  Column.make(#surfaceArea, ~grow=8, ()),
  Column.make(#orbitalPeriod, ~grow=5, ()),
  Column.make(#semiMajorAxis, ~grow=5, ()),
  Column.make(#inclination, ~grow=5, ()),
  Column.make(#eccentricity, ~grow=5, ()),
]

let cell = (~unit=?, id: Column.id, value: 'a, formatValue: 'a => string) => (
  (id :> string),
  value->formatValue ++
    switch unit {
    | None => ""
    | Some(u) => ` ${u}`
    },
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
      cell(#radius, a.radius, Format.radius, ~unit="m"),
      cell(#surfaceArea, a.surfaceArea, Format.surfaceArea, ~unit=`km²`),
      cell(#orbitalPeriod, a.orbitalPeriod, Format.orbitalPeriod, ~unit="d"),
      cell(#semiMajorAxis, a.semiMajorAxis, Format.semiMajorAxis, ~unit="AU"),
      cell(#inclination, a.inclination, Format.inclination, ~unit=`°`),
      cell(#spectralType, a.spectralType, spectralTypeToStr),
      cell(#eccentricity, a.eccentricity, Format.eccentricity),
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
  <DataTable
    columns
    data
    pagination
    sorting
    noDataText="No asteroids are matching your query. Try widening or removing some filters."
  />
}

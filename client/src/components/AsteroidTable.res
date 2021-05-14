open Belt
external spectralTypeToStr: Fragments.DataTableAsteroid.t_spectralType => string = "%identity"

let ownerCell = DataTable.CellRenderer.make("owner", address => <AsteroidOwner address />)
let columns = [
  DataTable.column(~id="id", ~name="ID", ~selector=Js.Dict.get(_, "id"), ~sortable=true, ()),
  DataTable.column(~id="name", ~name="Name", ~selector=Js.Dict.get(_, "name"), ~sortable=true, ()),
  DataTable.column(
    ~id="owner",
    ~name="Owner",
    ~selector=Js.Dict.get(_, "owner"),
    ~cellRenderer=ownerCell,
    ~sortable=true,
    (),
  ),
  DataTable.column(
    ~id="radius",
    ~name="Radius",
    ~selector=Js.Dict.get(_, "radius"),
    ~sortable=true,
    (),
  ),
  DataTable.column(
    ~id="surfaceArea",
    ~name="Surface area",
    ~selector=Js.Dict.get(_, "surfaceArea"),
    ~sortable=true,
    (),
  ),
  DataTable.column(
    ~id="orbitalPeriod",
    ~name="Orbital period",
    ~selector=Js.Dict.get(_, "orbitalPeriod"),
    ~sortable=true,
    (),
  ),
  DataTable.column(
    ~id="semiMajorAxis",
    ~name="Semi major axis",
    ~selector=Js.Dict.get(_, "semiMajorAxis"),
    ~sortable=true,
    (),
  ),
  DataTable.column(
    ~id="inclination",
    ~name="Inclination",
    ~selector=Js.Dict.get(_, "inclination"),
    ~sortable=true,
    (),
  ),
  DataTable.column(
    ~id="spectralType",
    ~name="Spectral type",
    ~selector=Js.Dict.get(_, "spectralType"),
    ~sortable=true,
    (),
  ),
]

@react.component
let make = (
  ~pageData: Fragments.DataTableAsteroidPage.t,
  ~currentPage,
  ~currentPageSize,
  ~pageSizeOptions,
  ~defaultSortFieldId=?,
  ~onChange,
  ~onSort,
) => {
  let data =
    pageData.rows
    ->Belt.Array.map(a => [
      ("id", a.id->Belt.Int.toString),
      ("name", a.name),
      ("owner", a.owner->Option.getWithDefault("")),
      ("radius", a.radius->Belt.Float.toString),
      ("surfaceArea", a.surfaceArea->Belt.Float.toString),
      ("orbitalPeriod", a.orbitalPeriod->Belt.Int.toString),
      ("semiMajorAxis", a.semiMajorAxis->Belt.Float.toString),
      ("inclination", a.inclination->Belt.Float.toString),
      ("spectralType", a.spectralType->spectralTypeToStr),
    ])
    ->Belt.Array.map(Js.Dict.fromArray)
  <DataTable.WithPagination
    columns
    data
    ?defaultSortFieldId
    totalRows={pageData.totalRows}
    currentPage
    currentPageSize
    pageSizeOptions
    onChange
    onSort
  />
}

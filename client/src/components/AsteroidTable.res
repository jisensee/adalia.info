external spectralTypeToStr: Fragments.DataTableAsteroid.t_spectralType => string = "%identity"

module Column = AsteroidTableColumn

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

let spectralTypeCell = DataTable.CellRenderer.make("spectralType", st =>
  <span>
    <span className="text-cyan text-xl font-bold"> {st->React.string} </span>
    {"-Type"->React.string}
  </span>
)

let rarityCell = DataTable.CellRenderer.make("rarity", rarity => <AsteroidRarity rarity />)

let makeColumn = column => {
  let (cell, minWidth, grow) = switch column {
  | Column.Id => (Some(idCell), "9rem", 0)
  | Column.Owner => (Some(ownerCell), "8rem", 0)
  | Column.Name => (None, "", 1)
  | Column.SpectralType => (Some(spectralTypeCell), "8rem", 0)
  | Column.EstimatedPrice => (None, "9rem", 0)
  | Column.Scanned => (None, "9rem", 0)
  | Column.Radius => (None, "8rem", 0)
  | Column.SurfaceArea => (None, "12rem", 0)
  | Column.Size => (None, "10rem", 0)
  | Column.OrbitalPeriod => (None, "12rem", 0)
  | Column.SemiMajorAxis => (None, "12rem", 0)
  | Column.Inclination => (None, "10rem", 0)
  | Column.Eccentricity => (None, "11rem", 0)
  | Column.Rarity => (Some(rarityCell), "10rem", 0)
  }
  DataTable.column(
    ~id=column->Column.toString,
    ~name=column->Column.toName,
    ~selector=Js.Dict.get(_, column->Column.toString),
    ~sortable=true,
    ~minWidth,
    ~grow,
    ~cell?,
    (),
  )
}

let makeDataTableColumns = columns => {
  let customColumns = columns->Belt.Array.map(makeColumn)
  [makeColumn(Column.Id)]->Belt.Array.concat(customColumns)
}

let cell = (
  ~unit=?,
  ~prependUnit=false,
  column: Column.t,
  value: 'a,
  formatValue: 'a => string,
) => (
  column->Column.toString,
  switch (formatValue(value), unit, prependUnit) {
  | ("", _, _) => ""
  | (formatted, None, _) => formatted
  | (formatted, Some(u), false) => `${formatted}${u}`
  | (formatted, Some(u), true) => `${u}${formatted}`
  },
)

let mapColumns = Belt.Array.map(_, makeColumn)

module Loading = {
  @react.component
  let make = (~columns) =>
    <DataTable.Loading columns={makeDataTableColumns(columns)} text={"Loading asteroids..."} />
}

@react.component
let make = (
  ~pageData: Fragments.DataTableAsteroidPage.t,
  ~pageSize,
  ~pageSizeOptions,
  ~defaultSortFieldId,
  ~onPageChange,
  ~onSort,
  ~columns: array<Column.t>,
  ~actions,
) => {
  open Belt
  let data =
    pageData.rows
    ->Array.map(a => [
      cell(Column.Id, a.id, Int.toString),
      cell(Column.Name, a.name, s => s),
      cell(Column.Owner, a.owner, Option.getWithDefault(_, "")),
      cell(Column.SpectralType, a.spectralType, spectralTypeToStr),
      cell(
        Column.EstimatedPrice,
        a.estimatedPrice,
        Belt.Option.mapWithDefault(_, "", Format.bigFloat),
        ~unit="$",
        ~prependUnit=true,
      ),
      cell(Column.Scanned, a.scanned, scanned => scanned ? "Yes" : "No"),
      cell(Column.Radius, a.radius, Format.bigFloat, ~unit=" m"),
      cell(Column.SurfaceArea, a.surfaceArea, Format.bigFloat, ~unit=` km²`),
      cell(Column.Size, a.asteroidSize.size, EnumUtils.sizeToString),
      cell(Column.OrbitalPeriod, a.orbitalPeriod, Format.orbitalPeriod, ~unit=" days"),
      cell(Column.SemiMajorAxis, a.semiMajorAxis, Format.semiMajorAxis, ~unit=" AU"),
      cell(Column.Inclination, a.inclination, Format.inclination, ~unit=`°`),
      cell(Column.Eccentricity, a.eccentricity, Format.eccentricity),
      cell(Column.Rarity, a.asteroidRarity.rarity, r =>
        r->Option.mapWithDefault("", EnumUtils.rarityToString)
      ),
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
  let title =
    <h3>
      <span className="hidden sm:inline"> {"Found "->React.string} </span>
      {`${pageData.totalRows->Int.toFloat->Format.formatFloat(0)} asteroids`->React.string}
    </h3>
  <DataTable
    title
    actions
    columns={makeDataTableColumns(columns)}
    data
    header={{DataTable.fixed: true, scrollHeight: "43rem"}}
    pagination
    sorting
    noDataText="No asteroids are matching your query. Try widening or removing some filters."
  />
}

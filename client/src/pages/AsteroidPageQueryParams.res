module QP = QueryParams
let tableColumnParam = {
  QP.encode: QP.encoder(columns =>
    columns->Belt.Array.map(AsteroidTableColumn.toString)->Js.Array2.joinWith(_, ",")->Some
  ),
  decode: QP.decoder(str =>
    str->Js.String2.split(_, ",")->Belt.Array.keepMap(AsteroidTableColumn.fromString)->Some
  ),
}

type t = {
  pageNum: int,
  setPageNum: QP.set<int>,
  pageSize: int,
  setPageSize: QP.set<int>,
  sort: QP.sortingType,
  setSort: QP.set<QP.sortingType>,
  columns: array<AsteroidTableColumn.t>,
  setColumns: QP.set<array<AsteroidTableColumn.t>>,
}

let use = () => {
  let defaultSort = {
    QP.field: AsteroidTableColumn.Id->AsteroidTableColumn.toString,
    mode: QP.SortMode.Ascending,
  }
  let (pageNum, setPageNum) = QP.useWithDefault("pageNum", QP.intParam, 1)
  let (pageSize, setPageSize) = QP.useWithDefault("pageSize", QP.intParam, 15)
  let (sort, setSort) = QP.useWithDefault("sort", QP.sortingParam, defaultSort)
  let (columns, setColumns) = QP.useWithDefault(
    "columns",
    tableColumnParam,
    AsteroidTableColumn.defaultColumns,
  )

  {
    pageNum: pageNum,
    setPageNum: setPageNum,
    pageSize: pageSize,
    setPageSize: setPageSize,
    sort: sort,
    setSort: setSort,
    columns: columns,
    setColumns: setColumns,
  }
}

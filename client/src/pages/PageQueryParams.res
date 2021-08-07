module AsteroidPageParamType = {
  open QueryParams

  type filters = {
    owned: option<bool>,
    radius: option<(int, int)>,
    spectralTypes: option<array<SpectralType.t>>,
    surfaceArea: option<(int, int)>,
    orbitalPeriod: option<(int, int)>,
    semiMajorAxis: option<(int, int)>,
    inclination: option<(int, int)>,
  }
  type t = {
    pageNum: option<int>,
    pageSize: option<int>,
    sort: option<sortingParam>,
    filters: option<filters>,
  }
  let fromDict = dict => {
    pageNum: dict->IntParam.fromDict("page"),
    pageSize: dict->IntParam.fromDict("pageSize"),
    sort: dict->SortingParam.fromDict("sort"),
    filters: Some({
      owned: dict->BoolParam.fromDict("owned"),
      radius: dict->IntRangeParam.fromDict("radius"),
      spectralTypes: dict->SpectralTypesParam.fromDict("spectralTypes"),
      surfaceArea: dict->IntRangeParam.fromDict("surfaceArea"),
      orbitalPeriod: dict->IntRangeParam.fromDict("orbitalPeriod"),
      semiMajorAxis: dict->IntRangeParam.fromDict("semiMajorAxis"),
      inclination: dict->IntRangeParam.fromDict("inclination"),
    }),
  }
  let toValues = ({pageNum, pageSize, sort, filters}) => {
    let getFilter = getter => filters->Belt.Option.flatMap(getter)
    [
      IntParam.toParam("page", pageNum),
      IntParam.toParam("pageSize", pageSize),
      SortingParam.toParam("sort", sort),
      BoolParam.toParam("owned", getFilter(f => f.owned)),
      IntRangeParam.toParam("radius", getFilter(f => f.radius)),
      SpectralTypesParam.toParam("spectralTypes", getFilter(f => f.spectralTypes)),
      IntRangeParam.toParam("surfaceArea", getFilter(f => f.surfaceArea)),
      IntRangeParam.toParam("orbitalPeriod", getFilter(f => f.orbitalPeriod)),
      IntRangeParam.toParam("semiMajorAxis", getFilter(f => f.semiMajorAxis)),
      IntRangeParam.toParam("inclination", getFilter(f => f.inclination)),
    ]
  }
}

module AsteroidPage = QueryParams.Make(AsteroidPageParamType)

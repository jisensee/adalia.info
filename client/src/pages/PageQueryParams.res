module AsteroidPageParamType = {
  open QueryParams

  type filters = {
    owned: option<bool>,
    scanned: option<bool>,
    radius: option<(float, float)>,
    spectralTypes: option<array<SpectralType.t>>,
    surfaceArea: option<(float, float)>,
    orbitalPeriod: option<(float, float)>,
    semiMajorAxis: option<(float, float)>,
    inclination: option<(float, float)>,
    eccentricity: option<(float, float)>,
    estimatedPrice: option<(float, float)>,
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
      scanned: dict->BoolParam.fromDict("scanned"),
      radius: dict->FloatRangeParam.fromDict("radius"),
      spectralTypes: dict->SpectralTypesParam.fromDict("spectralTypes"),
      surfaceArea: dict->FloatRangeParam.fromDict("surfaceArea"),
      orbitalPeriod: dict->FloatRangeParam.fromDict("orbitalPeriod"),
      semiMajorAxis: dict->FloatRangeParam.fromDict("semiMajorAxis"),
      inclination: dict->FloatRangeParam.fromDict("inclination"),
      eccentricity: dict->FloatRangeParam.fromDict("eccentricity"),
      estimatedPrice: dict->FloatRangeParam.fromDict("estimatedPrice"),
    }),
  }
  let toValues = ({pageNum, pageSize, sort, filters}) => {
    let getFilter = getter => filters->Belt.Option.flatMap(getter)
    [
      IntParam.toParam("page", pageNum),
      IntParam.toParam("pageSize", pageSize),
      SortingParam.toParam("sort", sort),
      BoolParam.toParam("owned", getFilter(f => f.owned)),
      BoolParam.toParam("scanned", getFilter(f => f.scanned)),
      FloatRangeParam.toParam("radius", getFilter(f => f.radius)),
      SpectralTypesParam.toParam("spectralTypes", getFilter(f => f.spectralTypes)),
      FloatRangeParam.toParam("surfaceArea", getFilter(f => f.surfaceArea)),
      FloatRangeParam.toParam("orbitalPeriod", getFilter(f => f.orbitalPeriod)),
      FloatRangeParam.toParam("semiMajorAxis", getFilter(f => f.semiMajorAxis)),
      FloatRangeParam.toParam("inclination", getFilter(f => f.inclination)),
      FloatRangeParam.toParam("eccentricity", getFilter(f => f.eccentricity)),
      FloatRangeParam.toParam("estimatedPrice", getFilter(f => f.estimatedPrice)),
    ]
  }
}

module AsteroidPage = QueryParams.Make(AsteroidPageParamType)

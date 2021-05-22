module AsteroidPageParamType = {
  open QueryParams
  type t = {
    pageNum: option<int>,
    pageSize: option<int>,
    sort: option<sortingParam>,
    owned: option<bool>,
    radius: option<(int, int)>,
    spectralTypes: option<array<SpectralType.t>>,
  }
  let fromDict = dict => {
    pageNum: dict->IntParam.fromDict("page"),
    pageSize: dict->IntParam.fromDict("pageSize"),
    sort: dict->SortingParam.fromDict("sort"),
    owned: dict->BoolParam.fromDict("owned"),
    radius: dict->IntRangeParam.fromDict("radius"),
    spectralTypes: dict->SpectralTypesParam.fromDict("spectralTypes"),
  }
  let toValues = ({pageNum, pageSize, sort, owned, radius, spectralTypes}) => [
    IntParam.toParam("page", pageNum),
    IntParam.toParam("pageSize", pageSize),
    SortingParam.toParam("sort", sort),
    BoolParam.toParam("owned", owned),
    IntRangeParam.toParam("radius", radius),
    SpectralTypesParam.toParam("spectralTypes", spectralTypes),
  ]
}

module AsteroidPage = QueryParams.Make(AsteroidPageParamType)

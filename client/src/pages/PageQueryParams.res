module AsteroidPageParamType = {
  open QueryParams
  type t = {
    pageNum: option<int>,
    pageSize: option<int>,
    sort: option<sortingParam>,
    owned: option<bool>,
    radius: option<(int, int)>,
  }
  let fromDict = dict => {
    pageNum: dict->IntParam.fromDict("page"),
    pageSize: dict->IntParam.fromDict("pageSize"),
    sort: dict->SortingParam.fromDict("sort"),
    owned: dict->BoolParam.fromDict("owned"),
    radius: dict->IntRangeParam.fromDict("radius"),
  }
  let toValues = ({pageNum, pageSize, sort, owned, radius}) => [
    IntParam.toParam("page", pageNum),
    IntParam.toParam("pageSize", pageSize),
    SortingParam.toParam("sort", sort),
    BoolParam.toParam("owned", owned),
    IntRangeParam.toParam("radius", radius),
  ]
}

module AsteroidPage = QueryParams.Make(AsteroidPageParamType)

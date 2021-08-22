module AsteroidPageParamType = {
  open QueryParams

  module AsteroidTableColumnsParam = MakeParam({
    type t = array<AsteroidTableColumn.t>

    let toString = columns =>
      columns->Belt.Array.map(AsteroidTableColumn.toString)->Js.Array2.joinWith(_, ",")

    let fromString = str =>
      str->Js.String2.split(_, ",")->Belt.Array.keepMap(AsteroidTableColumn.fromString)->Some
  })

  module AsteroidSizesParam = MakeParam({
    type t = array<Fragments.AsteroidSize.t_size>

    let toString = sizes => sizes->Belt.Array.map(EnumUtils.sizeToString)->Js.Array2.joinWith(",")

    let fromString = str =>
      str->Js.String2.split(",")->Belt.Array.keepMap(EnumUtils.sizeFromString)->Some
  })

  module AsteroidRaritiesParam = MakeParam({
    type t = array<Fragments.AsteroidRarity.t_rarity>

    let toString = sizes => sizes->Belt.Array.map(EnumUtils.rarityToString)->Js.Array2.joinWith(",")

    let fromString = str =>
      str->Js.String2.split(",")->Belt.Array.keepMap(EnumUtils.rarityFromString)->Some
  })

  type filters = {
    owned: option<bool>,
    scanned: option<bool>,
    radius: option<(float, float)>,
    spectralTypes: option<array<SpectralType.t>>,
    sizes: option<array<Fragments.AsteroidSize.t_size>>,
    surfaceArea: option<(float, float)>,
    orbitalPeriod: option<(float, float)>,
    semiMajorAxis: option<(float, float)>,
    inclination: option<(float, float)>,
    eccentricity: option<(float, float)>,
    estimatedPrice: option<(float, float)>,
    rarities: option<array<Fragments.AsteroidRarity.t_rarity>>,
  }
  type t = {
    pageNum: option<int>,
    pageSize: option<int>,
    sort: option<sortingParam>,
    filters: option<filters>,
    columns: option<array<AsteroidTableColumn.t>>,
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
      sizes: dict->AsteroidSizesParam.fromDict("sizes"),
      orbitalPeriod: dict->FloatRangeParam.fromDict("orbitalPeriod"),
      semiMajorAxis: dict->FloatRangeParam.fromDict("semiMajorAxis"),
      inclination: dict->FloatRangeParam.fromDict("inclination"),
      eccentricity: dict->FloatRangeParam.fromDict("eccentricity"),
      estimatedPrice: dict->FloatRangeParam.fromDict("estimatedPrice"),
      rarities: dict->AsteroidRaritiesParam.fromDict("rarities"),
    }),
    columns: dict->AsteroidTableColumnsParam.fromDict("columns"),
  }
  let toValues = ({pageNum, pageSize, sort, filters, columns}) => {
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
      AsteroidSizesParam.toParam("sizes", getFilter(f => f.sizes)),
      FloatRangeParam.toParam("orbitalPeriod", getFilter(f => f.orbitalPeriod)),
      FloatRangeParam.toParam("semiMajorAxis", getFilter(f => f.semiMajorAxis)),
      FloatRangeParam.toParam("inclination", getFilter(f => f.inclination)),
      FloatRangeParam.toParam("eccentricity", getFilter(f => f.eccentricity)),
      FloatRangeParam.toParam("estimatedPrice", getFilter(f => f.estimatedPrice)),
      AsteroidRaritiesParam.toParam("rarities", getFilter(f => f.rarities)),
      AsteroidTableColumnsParam.toParam("columns", columns),
    ]
  }
}

module AsteroidPage = QueryParams.Make(AsteroidPageParamType)

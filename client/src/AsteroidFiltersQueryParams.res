module Filter = AsteroidFilters.Filter
module QP = QueryParams
let filterEncoder = encoder =>
  QP.encoder(f =>
    switch f {
    | {Filter.active: false} => None
    | {Filter.active: true} => encoder(f.value)
    }
  )

let filterDecoder = decoder =>
  QP.decoder(str =>
    switch decoder(str) {
    | Some(value) =>
      {
        Filter.active: true,
        value: value,
      }->Some
    | None => None
    }
  )

let filterParam = paramType => {
  QP.encode: filter =>
    switch filter {
    | Some({Filter.active: true, value}) => paramType.QP.encode(value->Some)
    | Some({Filter.active: false}) | None => None
    },
  QP.decode: str =>
    switch paramType.decode(str) {
    | Some(value) =>
      {
        Filter.active: true,
        value: value,
      }->Some
    | None => None
    },
}

let spectralTypesParam = {
  QP.encode: filterEncoder(spectralTypes =>
    spectralTypes->Belt.Array.map(EnumUtils.spectralTypeToString)->Js.Array2.joinWith(",")->Some
  ),
  QP.decode: filterDecoder(str =>
    str->Js.String2.split(",")->Belt.Array.keepMap(EnumUtils.spectralTypeFromString)->Some
  ),
}

let asteroidSizesParam = {
  QP.encode: filterEncoder(sizes =>
    sizes->Belt.Array.map(EnumUtils.sizeToString)->Js.Array2.joinWith(",")->Some
  ),
  decode: filterDecoder(str =>
    str->Js.String2.split(",")->Belt.Array.keepMap(EnumUtils.sizeFromString)->Some
  ),
}

let asteroidRaritiesParam = {
  QP.encode: filterEncoder(rarities =>
    rarities->Belt.Array.map(EnumUtils.rarityToString)->Js.Array2.joinWith(",")->Some
  ),
  decode: filterDecoder(str =>
    str->Js.String2.split(",")->Belt.Array.keepMap(EnumUtils.rarityFromString)->Some
  ),
}

let asteroidBonusesParam = {
  QP.encode: filterEncoder(bonuses => bonuses->AsteroidBonusFilter.toString->Some),
  decode: filterDecoder(AsteroidBonusFilter.fromString),
}

let use = () => {
  let default = AsteroidFilters.defaultFilters

  let (owned, setOwned) = QP.useWithDefault("owned", QP.legacyBoolParam->filterParam, default.owned)
  let (owners, setOwners) = QP.useWithDefault(
    "owners",
    QP.stringArrayParam->filterParam,
    default.owners,
  )
  let (scanned, setScanned) = QP.useWithDefault(
    "scanned",
    QP.legacyBoolParam->filterParam,
    default.scanned,
  )
  let (spectralTypes, setSpectralTypes) = QP.useWithDefault(
    "spectralTypes",
    spectralTypesParam,
    default.spectralTypes,
  )
  let (radius, setRadius) = QP.useWithDefault(
    "radius",
    QP.floatRangeParam->filterParam,
    default.radius,
  )
  let (surfaceArea, setSurfaceArea) = QP.useWithDefault(
    "surfaceArea",
    QP.floatRangeParam->filterParam,
    default.surfaceArea,
  )
  let (sizes, setSizes) = QP.useWithDefault("sizes", asteroidSizesParam, default.sizes)
  let (orbitalPeriod, setOrbitalPeriod) = QP.useWithDefault(
    "orbitalPeriod",
    QP.floatRangeParam->filterParam,
    default.orbitalPeriod,
  )
  let (semiMajorAxis, setSemiMajorAxis) = QP.useWithDefault(
    "semiMajorAxis",
    QP.floatRangeParam->filterParam,
    default.semiMajorAxis,
  )
  let (inclination, setInclination) = QP.useWithDefault(
    "inclination",
    QP.floatRangeParam->filterParam,
    default.inclination,
  )
  let (eccentricity, setEccentricity) = QP.useWithDefault(
    "eccentricity",
    QP.floatRangeParam->filterParam,
    default.eccentricity,
  )
  let (estimatedPrice, setEstimatedPrice) = QP.useWithDefault(
    "estimatedPrice",
    QP.floatRangeParam->filterParam,
    default.estimatedPrice,
  )
  let (rarities, setRarities) = QP.useWithDefault(
    "rarities",
    asteroidRaritiesParam,
    default.rarities,
  )
  let (bonuses, setBonuses) = QP.useWithDefault("bonuses", asteroidBonusesParam, default.bonuses)

  let {filters, setFilters} = AsteroidFilters.Store.use()
  let urlFilters = {
    AsteroidFilters.owned: owned,
    owners: owners,
    scanned: scanned,
    spectralTypes: spectralTypes,
    radius: radius,
    surfaceArea: surfaceArea,
    sizes: sizes,
    orbitalPeriod: orbitalPeriod,
    semiMajorAxis: semiMajorAxis,
    inclination: inclination,
    eccentricity: eccentricity,
    estimatedPrice: estimatedPrice,
    rarities: rarities,
    bonuses: bonuses,
  }

  React.useEffect1(() => {
    setOwned(filters.owned, #replaceIn)
    setOwners(filters.owners, #replaceIn)
    setScanned(filters.scanned, #replaceIn)
    setSpectralTypes(filters.spectralTypes, #replaceIn)
    setRadius(filters.radius, #replaceIn)
    setSurfaceArea(filters.surfaceArea, #replaceIn)
    setSizes(filters.sizes, #replaceIn)
    setOrbitalPeriod(filters.orbitalPeriod, #replaceIn)
    setSemiMajorAxis(filters.semiMajorAxis, #replaceIn)
    setInclination(filters.inclination, #replaceIn)
    setEccentricity(filters.eccentricity, #replaceIn)
    setEstimatedPrice(filters.estimatedPrice, #replaceIn)
    setRarities(filters.rarities, #replaceIn)
    setBonuses(filters.bonuses, #replaceIn)
    None
  }, [filters])

  React.useEffect0(() => {
    if !(filters->AsteroidFilters.isActive) {
      setFilters(urlFilters)
    }
    None
  })
}

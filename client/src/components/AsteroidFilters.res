module Filter = {
  type t<'a> = {
    active: bool,
    value: 'a,
  }

  let toOption = t =>
    switch t.active {
    | true => Some(t.value)
    | false => None
    }

  let disable = f => {...f, active: false}

  @react.component
  let make = (~className="", ~label, ~filter, ~onChange, ~makeFilterComp) => {
    let onCheckboxChange = e => {
      let checked: bool = ReactEvent.Form.currentTarget(e)["checked"]
      onChange({...filter, active: checked})->ignore
    }
    let onFilterChange = newFilterValue => onChange({...filter, value: newFilterValue})->ignore

    <div className={`${className} flex flex-col`}>
      <label className="mb-3 font-bold">
        <input
          className="mr-3" type_="checkbox" checked={filter.active} onChange=onCheckboxChange
        />
        {label->React.string}
      </label>
      {makeFilterComp(filter.value, onFilterChange, filter.active)}
    </div>
  }
}

type t = {
  owned: Filter.t<bool>,
  scanned: Filter.t<bool>,
  spectralTypes: Filter.t<array<SpectralType.t>>,
  radius: Filter.t<(float, float)>,
  surfaceArea: Filter.t<(float, float)>,
  orbitalPeriod: Filter.t<(float, float)>,
  semiMajorAxis: Filter.t<(float, float)>,
  inclination: Filter.t<(float, float)>,
  eccentricity: Filter.t<(float, float)>,
}
let disableAll = filter => {
  owned: filter.owned->Filter.disable,
  scanned: filter.scanned->Filter.disable,
  spectralTypes: filter.spectralTypes->Filter.disable,
  radius: filter.radius->Filter.disable,
  surfaceArea: filter.surfaceArea->Filter.disable,
  orbitalPeriod: filter.orbitalPeriod->Filter.disable,
  semiMajorAxis: filter.semiMajorAxis->Filter.disable,
  inclination: filter.inclination->Filter.disable,
  eccentricity: filter.eccentricity->Filter.disable,
}
let toQueryParamFilter = asteroidFilter => {
  PageQueryParams.AsteroidPageParamType.owned: asteroidFilter.owned->Filter.toOption,
  scanned: asteroidFilter.scanned->Filter.toOption,
  radius: asteroidFilter.radius->Filter.toOption,
  spectralTypes: asteroidFilter.spectralTypes->Filter.toOption,
  surfaceArea: asteroidFilter.surfaceArea->Filter.toOption,
  orbitalPeriod: asteroidFilter.orbitalPeriod->Filter.toOption,
  semiMajorAxis: asteroidFilter.semiMajorAxis->Filter.toOption,
  inclination: asteroidFilter.inclination->Filter.toOption,
  eccentricity: asteroidFilter.eccentricity->Filter.toOption,
}

let correctValue = ((from, to_), (min, max)) => (
  Js.Math.max_float(from, min),
  Js.Math.min_float(to_, max),
)

let correctFilter = f => {
  ...f,
  radius: {
    ...f.radius,
    value: correctValue(f.radius.value, Defaults.radiusBounds),
  },
  surfaceArea: {
    ...f.surfaceArea,
    value: correctValue(f.surfaceArea.value, Defaults.surfaceBounds),
  },
  orbitalPeriod: {
    ...f.orbitalPeriod,
    value: correctValue(f.orbitalPeriod.value, Defaults.orbitalPeriodBounds),
  },
  semiMajorAxis: {
    ...f.semiMajorAxis,
    value: correctValue(f.semiMajorAxis.value, Defaults.semiMajorAxisBounds),
  },
  inclination: {
    ...f.inclination,
    value: correctValue(f.inclination.value, Defaults.inclinationBounds),
  },
  eccentricity: {
    ...f.eccentricity,
    value: correctValue(f.eccentricity.value, Defaults.eccentricityBounds),
  },
}

let isActive = f =>
  [
    f.owned.active,
    f.scanned.active,
    f.radius.active,
    f.surfaceArea.active,
    f.orbitalPeriod.active,
    f.semiMajorAxis.active,
    f.inclination.active,
    f.eccentricity.active,
  ]->Belt.Array.some(active => active)

module BoolFilter = {
  @react.component
  let make = (~filter, ~onChange, ~label, ~trueText, ~falseText) => {
    let options = [("yes", trueText), ("no", falseText)]
    let toString = val =>
      switch val {
      | true => "yes"
      | false => "no"
      }
    let fromString = str =>
      switch str {
      | "yes" => true
      | _ => false
      }

    let makeFilterComp = (v, oc, enabled) =>
      <Common.Select value=v onChange=oc options toString fromString enabled />
    <Filter label filter onChange makeFilterComp />
  }
}

module NumberRangeFilter = {
  @react.component
  let make = (~filter, ~onChange, ~label) => {
    let makeFilterComp = (value, oc, enabled) =>
      <Common.NumberRangeInput value onChange=oc enabled inputClassName="w-32" />
    <Filter label filter onChange makeFilterComp />
  }
}

module SpectralTypeFilter = {
  @react.component
  let make = (~filter, ~onChange) => {
    let makeFilterComp = (v, oc, enabled) => <SpectralTypePicker selected=v onChange=oc enabled />
    <Filter label="Spectral types" filter onChange makeFilterComp />
  }
}

@react.component
let make = (~className="", ~filters, ~onChange, ~onApply, ~onReset) => {
  let onOwnedChange = owned => onChange({...filters, owned: owned})
  let onScannedChange = scanned => onChange({...filters, scanned: scanned})
  let onRadiusChange = radius => onChange({...filters, radius: radius})
  let onSpectralTypesChange = spectralTypes => onChange({...filters, spectralTypes: spectralTypes})
  let onSurfaceAreaChange = surfaceArea => onChange({...filters, surfaceArea: surfaceArea})
  let onOrbitalPeriodChange = orbitalPeriod => onChange({...filters, orbitalPeriod: orbitalPeriod})
  let onSemiMajorAxisChange = semiMajorAxis => onChange({...filters, semiMajorAxis: semiMajorAxis})
  let onInclinationChange = inclination => onChange({...filters, inclination: inclination})
  let onEccentricityChange = eccentricity => onChange({...filters, eccentricity: eccentricity})
  let (filtersVisible, setFiltersVisible) = React.useState(() => filters->isActive)
  let iconKind = Icon.Fas("chevron-right")
  let (iconRotation, height) = switch filtersVisible {
  | true => (Some(Icon.Rotate90), "max-h-96")
  | false => (None, "max-h-0")
  }
  <div className>
    <div className="cursor-pointer" onClick={_ => setFiltersVisible(v => !v)}>
      <Icon
        className="text-cyan w-3 transition-all duration-300" kind=iconKind rotation=?iconRotation>
        <h2 className="pl-2"> {"Filters"->React.string} </h2>
      </Icon>
    </div>
    <form onSubmit={ReactEvent.Form.preventDefault}>
      <div
        className={`flex flex-col items-start overflow-hidden ${height} transition-max-height duration-300 ease-in-out`}>
        <div className="flex flex-row space-x-10 mb-4">
          <div className="flex-col space-y-3">
            <BoolFilter
              filter=filters.owned
              onChange=onOwnedChange
              label="Ownership"
              trueText="Owned"
              falseText="Unowned"
            />
            <BoolFilter
              filter=filters.scanned
              onChange=onScannedChange
              label="Scanned"
              trueText="Yes"
              falseText="No"
            />
          </div>
          <SpectralTypeFilter filter=filters.spectralTypes onChange=onSpectralTypesChange />
          <div className="flex-col space-y-3">
            <NumberRangeFilter filter=filters.radius onChange=onRadiusChange label="Radius (m)" />
            <NumberRangeFilter
              filter=filters.surfaceArea onChange=onSurfaceAreaChange label=`Surface area (km²)`
            />
          </div>
          <div className="flex-col space-y-3">
            <NumberRangeFilter
              filter=filters.semiMajorAxis
              onChange=onSemiMajorAxisChange
              label="Semi major axis (AU)"
            />
            <NumberRangeFilter
              filter=filters.inclination onChange=onInclinationChange label="Inclination (degrees)"
            />
          </div>
          <div className="flex-col space-y-3">
            <NumberRangeFilter
              filter=filters.orbitalPeriod
              onChange=onOrbitalPeriodChange
              label="Orbital period (days)"
            />
            <NumberRangeFilter
              filter=filters.eccentricity onChange=onEccentricityChange label="Eccentricity"
            />
          </div>
        </div>
        <div className="flex flex-row space-x-9">
          <button type_="submit" onClick={_ => onApply()}>
            <Icon kind={Icon.Fas("check")} text="Apply" />
          </button>
          <button onClick={_ => onReset()}> <Icon kind={Icon.Fas("times")} text="Reset" /> </button>
        </div>
      </div>
    </form>
  </div>
}

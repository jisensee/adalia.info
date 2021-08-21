open Belt

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
          className="ml-1 mr-3" type_="checkbox" checked={filter.active} onChange=onCheckboxChange
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
  sizes: Filter.t<array<Fragments.AsteroidSize.t_size>>,
  orbitalPeriod: Filter.t<(float, float)>,
  semiMajorAxis: Filter.t<(float, float)>,
  inclination: Filter.t<(float, float)>,
  eccentricity: Filter.t<(float, float)>,
  estimatedPrice: Filter.t<(float, float)>,
}
let disableAll = filter => {
  owned: filter.owned->Filter.disable,
  scanned: filter.scanned->Filter.disable,
  spectralTypes: filter.spectralTypes->Filter.disable,
  radius: filter.radius->Filter.disable,
  sizes: filter.sizes->Filter.disable,
  surfaceArea: filter.surfaceArea->Filter.disable,
  orbitalPeriod: filter.orbitalPeriod->Filter.disable,
  semiMajorAxis: filter.semiMajorAxis->Filter.disable,
  inclination: filter.inclination->Filter.disable,
  eccentricity: filter.eccentricity->Filter.disable,
  estimatedPrice: filter.estimatedPrice->Filter.disable,
}
let toQueryParamFilter = asteroidFilter => {
  PageQueryParams.AsteroidPageParamType.owned: asteroidFilter.owned->Filter.toOption,
  scanned: asteroidFilter.scanned->Filter.toOption,
  radius: asteroidFilter.radius->Filter.toOption,
  spectralTypes: asteroidFilter.spectralTypes->Filter.toOption,
  surfaceArea: asteroidFilter.surfaceArea->Filter.toOption,
  sizes: asteroidFilter.sizes->Filter.toOption,
  orbitalPeriod: asteroidFilter.orbitalPeriod->Filter.toOption,
  semiMajorAxis: asteroidFilter.semiMajorAxis->Filter.toOption,
  inclination: asteroidFilter.inclination->Filter.toOption,
  eccentricity: asteroidFilter.eccentricity->Filter.toOption,
  estimatedPrice: asteroidFilter.estimatedPrice->Filter.toOption,
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
    f.sizes.active,
    f.orbitalPeriod.active,
    f.semiMajorAxis.active,
    f.inclination.active,
    f.eccentricity.active,
    f.estimatedPrice.active,
  ]->Array.some(active => active)

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

module SpectralTypePicker = {
  @react.component
  let make = (~selected, ~onChange, ~enabled) => {
    let optionToString = (option: SpectralType.t) => (option :> string)
    let options: array<SpectralType.t> = [#C, #CI, #CIS, #CM, #CMS, #CS, #I, #M, #S, #SI, #SM]
    <ListSelect options selected onChange optionToString enabled />
  }
}

module SizePicker = {
  @react.component
  let make = (~selected, ~onChange, ~enabled) => {
    let optionToString = EnumUtils.sizeToString
    let options: array<Fragments.AsteroidSize.t_size> = [#SMALL, #MEDIUM, #LARGE, #HUGE]
    <ListSelect options selected onChange optionToString enabled elementWidth="w-20" />
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

module SizeFilter = {
  @react.component
  let make = (~filter, ~onChange) => {
    let makeFilterComp = (v, oc, enabled) => <SizePicker selected=v onChange=oc enabled />
    <Filter label="Size" filter onChange makeFilterComp />
  }
}

module Buttons = {
  @react.component
  let make = (~onApply, ~onReset) =>
    <div className="flex flex-row space-x-5 mt-2">
      <button type_="submit" onClick={_ => onApply()}>
        <Icon kind={Icon.Fas("check")} text="Apply" />
      </button>
      <button onClick={_ => onReset()}> <Icon kind={Icon.Fas("times")} text="Reset" /> </button>
    </div>
}

module FilterCategory = {
  @react.component
  let make = (~children, ~title, ~isOpen, ~onOpenChange) =>
    <CollapsibleContent
      className="flex flex-row flex-wrap -ml-5"
      titleComp={<h3> {title->React.string} </h3>}
      isOpen
      onOpenChange>
      {children->React.Children.map(c => <div className="pr-5 pl-5 pb-3"> c </div>)}
    </CollapsibleContent>
}

module GeneralFilters = {
  @react.component
  let make = (~filters, ~onChange: t => unit) => {
    let allOthersDisabled =
      [
        filters.radius.active,
        filters.surfaceArea.active,
        filters.orbitalPeriod.active,
        filters.inclination.active,
        filters.semiMajorAxis.active,
        filters.eccentricity.active,
        filters.estimatedPrice.active,
        filters.sizes.active,
      ]->Array.every(active => active === false)
    let anyGeneralEnabled =
      [filters.owned.active, filters.scanned.active, filters.spectralTypes.active]->Array.some(a =>
        a
      )
    let initialIsOpen = allOthersDisabled || anyGeneralEnabled
    let (isOpen, setOpen) = React.useState(_ => initialIsOpen)
    <FilterCategory title="General" isOpen onOpenChange={o => setOpen(_ => o)}>
      <BoolFilter
        filter=filters.owned
        onChange={owned => onChange({...filters, owned: owned})}
        label="Ownership"
        trueText="Owned"
        falseText="Unowned"
      />
      <BoolFilter
        filter=filters.scanned
        onChange={scanned => onChange({...filters, scanned: scanned})}
        label="Scanned"
        trueText="Yes"
        falseText="No"
      />
      <SpectralTypeFilter
        filter=filters.spectralTypes
        onChange={spType => onChange({...filters, spectralTypes: spType})}
      />
    </FilterCategory>
  }
}

module SizeFilters = {
  @react.component
  let make = (~filters, ~onChange: t => unit) => {
    let initialIsOpen =
      [
        filters.radius.active,
        filters.surfaceArea.active,
        filters.estimatedPrice.active,
        filters.sizes.active,
      ]->Array.some(a => a)

    let (isOpen, setOpen) = React.useState(_ => initialIsOpen)

    <FilterCategory title="Size" isOpen onOpenChange={o => setOpen(_ => o)}>
      <NumberRangeFilter
        filter=filters.radius
        onChange={radius => onChange({...filters, radius: radius})}
        label="Radius (m)"
      />
      <NumberRangeFilter
        filter=filters.surfaceArea
        onChange={surfaceArea => onChange({...filters, surfaceArea: surfaceArea})}
        label=`Surface area (km²)`
      />
      <NumberRangeFilter
        filter=filters.estimatedPrice
        onChange={estimatedPrice => onChange({...filters, estimatedPrice: estimatedPrice})}
        label="Estimated price ($)"
      />
      <SizeFilter filter=filters.sizes onChange={sizes => onChange({...filters, sizes: sizes})} />
    </FilterCategory>
  }
}

module OrbitalFilters = {
  @react.component
  let make = (~filters, ~onChange: t => unit) => {
    let initialIsOpen =
      [
        filters.semiMajorAxis.active,
        filters.inclination.active,
        filters.orbitalPeriod.active,
        filters.eccentricity.active,
      ]->Array.some(a => a)

    let (isOpen, setOpen) = React.useState(_ => initialIsOpen)

    <FilterCategory title="Orbitals" isOpen onOpenChange={o => setOpen(_ => o)}>
      <NumberRangeFilter
        filter=filters.semiMajorAxis
        onChange={semiMajorAxis => onChange({...filters, semiMajorAxis: semiMajorAxis})}
        label="Semi major axis (AU)"
      />
      <NumberRangeFilter
        filter=filters.inclination
        onChange={inclination => onChange({...filters, inclination: inclination})}
        label="Inclination (degrees)"
      />
      <NumberRangeFilter
        filter=filters.orbitalPeriod
        onChange={orbitalPeriod => onChange({...filters, orbitalPeriod: orbitalPeriod})}
        label="Orbital period (days)"
      />
      <NumberRangeFilter
        filter=filters.eccentricity
        onChange={eccentricity => onChange({...filters, eccentricity: eccentricity})}
        label="Eccentricity"
      />
    </FilterCategory>
  }
}

@react.component
let make = (~className="", ~filters, ~onChange, ~onApply, ~onReset) => {
  let (filtersVisible, setFiltersVisible) = React.useState(() => filters->isActive)
  <CollapsibleContent
    className
    titleComp={<h2> {"Filters"->React.string} </h2>}
    isOpen=filtersVisible
    onOpenChange={isOpen => setFiltersVisible(_ => isOpen)}>
    <form className="flex flex-col space-y-3" onSubmit={ReactEvent.Form.preventDefault}>
      <GeneralFilters filters onChange />
      <SizeFilters filters onChange />
      <OrbitalFilters filters onChange />
      <div />
      <Buttons onApply onReset />
      <div />
    </form>
  </CollapsibleContent>
}

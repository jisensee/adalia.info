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
  spectralTypes: Filter.t<array<SpectralType.t>>,
  radius: Filter.t<(int, int)>,
}

let correctRadius = ((from, to_)) => (Js.Math.max_int(from, 100), Js.Math.min_int(to_, 900))
let correctFilter = f => {
  ...f,
  radius: {
    ...f.radius,
    value: correctRadius(f.radius.value),
  },
}

let isActive = t => t.owned.active || t.spectralTypes.active || t.radius.active

module OwnedFilter = {
  @react.component
  let make = (~filter, ~onChange) => {
    let options = [("owned", "Owned"), ("unowned", "Unowned")]
    let toString = val =>
      switch val {
      | true => "owned"
      | false => "unowned"
      }
    let fromString = str =>
      switch str {
      | "owned" => true
      | _ => false
      }

    let makeFilterComp = (v, oc, enabled) =>
      <Common.Select value=v onChange=oc options toString fromString enabled />
    <Filter label="Ownership" filter onChange makeFilterComp />
  }
}

module RadiusFilter = {
  @react.component
  let make = (~filter, ~onChange) => {
    let makeFilterComp = ((lower, upper), oc, enabled) =>
      <div className="flex flex-row items-center space-x-3">
        <Common.NumberInput
          className="w-32" value=lower onChange={newLower => oc((newLower, upper))} enabled
        />
        <Icon className="text-cyan" kind={Icon.Fas("minus")} />
        <Common.NumberInput
          className="w-32" value=upper onChange={newUpper => oc((lower, newUpper))} enabled
        />
      </div>
    <Filter label="Radius (m)" filter onChange makeFilterComp />
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
let make = (~className="", ~filter, ~onChange, ~onApply) => {
  let onOwnedChange = owned => onChange({...filter, owned: owned})
  let onRadiusChange = radius => onChange({...filter, radius: radius})
  let onSpectralTypesChange = spectralTypes => onChange({...filter, spectralTypes: spectralTypes})
  let (filtersVisible, setFiltersVisible) = React.useState(() => filter->isActive)
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
    <div
      className={`flex flex-col items-start overflow-hidden ${height} transition-max-height duration-300 ease-in-out`}>
      <div className="flex flex-row space-x-10 mb-4">
        <div className="flex-col space-y-3">
          <OwnedFilter filter=filter.owned onChange=onOwnedChange />
          <RadiusFilter filter=filter.radius onChange=onRadiusChange />
        </div>
        <SpectralTypeFilter filter=filter.spectralTypes onChange=onSpectralTypesChange />
      </div>
      <button onClick={_ => onApply()}> <Icon kind={Icon.Fas("check")} text="Apply" /> </button>
    </div>
  </div>
}

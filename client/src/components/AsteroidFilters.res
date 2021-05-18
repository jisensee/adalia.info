type spectralType = [#C | #CI | #CIS | #CM | #CMS | #CS | #I | #M | #S | #SI | #SM]

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
  let make = (~label, ~filter, ~onChange, ~makeFilterComp) => {
    let onCheckboxChange = e => {
      let checked: bool = ReactEvent.Form.currentTarget(e)["checked"]
      onChange({...filter, active: checked})->ignore
    }
    let onFilterChange = newFilterValue => onChange({...filter, value: newFilterValue})->ignore

    <div className="flex flex-col">
      <label className="mb-3">
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
  spectralTypes: Filter.t<array<spectralType>>,
}

let isActive = t => t.owned.active || t.spectralTypes.active

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

@react.component
let make = (~className="", ~filter, ~onChange) => {
  let onOwnedChange = owned => onChange({...filter, owned: owned})
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
      className={`flex overflow-hidden flex-row ${height} transition-max-height duration-300 ease-in-out`}>
      <OwnedFilter filter=filter.owned onChange=onOwnedChange />
    </div>
  </div>
}

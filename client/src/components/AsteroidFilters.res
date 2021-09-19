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
  owners: Filter.t<array<string>>,
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
  rarities: Filter.t<array<Fragments.AsteroidRarity.t_rarity>>,
  bonuses: Filter.t<AsteroidBonusFilter.t>,
}

let isActive = f =>
  [
    f.owned.active,
    f.owners.active,
    f.scanned.active,
    f.spectralTypes.active,
    f.radius.active,
    f.surfaceArea.active,
    f.sizes.active,
    f.orbitalPeriod.active,
    f.semiMajorAxis.active,
    f.inclination.active,
    f.eccentricity.active,
    f.estimatedPrice.active,
    f.rarities.active,
    f.bonuses.active,
  ]->Array.some(active => active)

module FilterFormatter = {
  let bool = value =>
    switch value {
    | true => "Yes"
    | false => "No"
    }
  let range = (~formatValue=Format.bigFloat, ~unit="", (from, to_)) => {
    let fromFormatted = `${formatValue(from)} ${unit}`
    let toFormatted = `${formatValue(to_)} ${unit}`
    `${fromFormatted} - ${toFormatted}`
  }
  let list = (items, formatItem) => items->Array.map(formatItem)->Js.Array2.joinWith(", ")

  let owned = bool(_)
  let scanned = bool(_)
  let radius = range(_, ~unit="m")
  let surfaceArea = range(_, ~unit="km²")
  let orbitalPeriod = range(_, ~unit="days")
  let semiMajorAxis = range(_, ~unit="AU")
  let inclination = range(_, ~unit="°")
  let eccentricity = range(_)
  let price = (value, currency) => range(value, ~formatValue=Format.price(_, currency))
  let spectralTypes = list(_, EnumUtils.spectralTypeToString)
  let rarities = list(_, EnumUtils.rarityToString)
  let sizes = list(_, EnumUtils.sizeToString)
  let bonuses = value => {
    open AsteroidBonusFilter
    let mode = switch value.mode {
    | #AND => "AND"
    | #OR => "OR"
    }
    let formatCondition = bonus => {
      let name =
        bonus.Condition.type_->Option.map(EnumUtils.bonusTypeToName)->Option.getWithDefault("")
      let levels = switch List.fromArray(bonus.Condition.levels) {
      | list{} => ""
      | items => `[${items->List.map(Int.toString)->List.toArray->Js.Array2.joinWith(", ")}]`
      }
      name ++ levels
    }
    value.conditions->Array.map(formatCondition)->Js.Array2.joinWith(` ${mode} `)
  }
}

module Summary = {
  type formatter<'a> = Str('a => string) | Element('a => React.element)
  @react.component
  let make = (~className="", ~filters) => {
    let currency = Currency.Context.use()
    let getFilter = (filter, prefix, formatter) =>
      switch filter.Filter.active {
      | true =>
        Some(
          <div key=prefix className="inline font-bold">
            <span className="text-cyan"> {React.string(prefix ++ ": ")} </span>
            {switch formatter {
            | Str(f) => filter.value->f->React.string
            | Element(f) => filter.value->f
            }}
          </div>,
        )
      | false => None
      }

    let formatOwners = owners => {
      let address = owners->Array.get(0)->Option.getWithDefault("")
      <AsteroidOwner address shortAddress={true} />
    }
    switch filters->isActive {
    | false => React.null
    | true =>
      let elements =
        [
          getFilter(filters.owned, "Owned", Str(FilterFormatter.owned)),
          getFilter(filters.owners, "Owner", Element(formatOwners)),
          getFilter(filters.scanned, "Scanned", Str(FilterFormatter.scanned)),
          getFilter(filters.spectralTypes, "Spectral types", Str(FilterFormatter.spectralTypes)),
          getFilter(filters.radius, "Radius", Str(FilterFormatter.radius)),
          getFilter(filters.sizes, "Sizes", Str(FilterFormatter.sizes)),
          getFilter(filters.surfaceArea, "Surface area", Str(FilterFormatter.surfaceArea)),
          getFilter(filters.orbitalPeriod, "Orbital period", Str(FilterFormatter.orbitalPeriod)),
          getFilter(filters.semiMajorAxis, "Semi major axis", Str(FilterFormatter.semiMajorAxis)),
          getFilter(filters.inclination, "Inclination", Str(FilterFormatter.inclination)),
          getFilter(filters.eccentricity, "Eccentricity", Str(FilterFormatter.eccentricity)),
          getFilter(
            filters.estimatedPrice,
            "Last sale price",
            Str(FilterFormatter.price(_, currency)),
          ),
          getFilter(filters.rarities, "Rarities", Str(FilterFormatter.rarities)),
          getFilter(filters.bonuses, "Bonuses", Str(FilterFormatter.bonuses)),
        ]->Array.keepMap(e => e)
      let size = elements->Array.size
      <div className>
        {elements
        ->Array.mapWithIndex((index, e) =>
          switch index < size - 1 {
          | true => <> e {", "->React.string} </>
          | false => e
          }
        )
        ->React.array}
      </div>
    }
  }
}

let disableAll = filter => {
  owned: filter.owned->Filter.disable,
  owners: filter.owners->Filter.disable,
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
  rarities: filter.rarities->Filter.disable,
  bonuses: {
    active: false,
    value: {
      ...filter.bonuses.value,
      conditions: [],
    },
  },
}
let toQueryParamFilter = asteroidFilter => {
  PageQueryParams.AsteroidPageParamType.owned: asteroidFilter.owned->Filter.toOption,
  owners: asteroidFilter.owners->Filter.toOption,
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
  rarities: asteroidFilter.rarities->Filter.toOption,
  bonuses: asteroidFilter.bonuses->Filter.toOption,
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
  type step = Static(float) | Log

  let getProps = (~min, ~max, ~value, ~step) =>
    switch step {
    | Static(s) => {
        Slider.min: min,
        max: max,
        value: value,
        revertValue: v => v,
        step: s,
      }
    | Log => Slider.getLogProps(~min, ~max, ~value)
    }

  @react.component
  let make = (~filter, ~onChange, ~label, ~bounds, ~step, ~formatValue) => {
    let (min, max) = bounds
    let makeFilterComp = (value, oc, enabled) => {
      let (left, right) = value
      let leftStr = left->formatValue
      let rightStr = right->formatValue

      let props = getProps(~min, ~max, ~value, ~step)
      let opacity = switch enabled {
      | true => ""
      | false => "opacity-disabled"
      }

      <div className={`w-72 ml-3 ${opacity}`}>
        <Slider
          value=props.value
          onChange={v => v->props.revertValue->oc}
          min=props.min
          max=props.max
          step=props.step
          disabled={!enabled}
          allowCross={false}
        />
        {`${leftStr} - ${rightStr}`->React.string}
      </div>
    }

    <Filter label filter onChange makeFilterComp />
  }
}

module RaritiesFilter = {
  @react.component
  let make = (~filter, ~onChange) => {
    let makeFilterComp = (v, oc, enabled) => {
      let optionToString = EnumUtils.rarityToString
      let options: array<Fragments.AsteroidRarity.t_rarity> = [
        #COMMON,
        #UNCOMMON,
        #RARE,
        #SUPERIOR,
        #EXCEPTIONAL,
        #INCOMPARABLE,
      ]
      <ListSelect options selected=v onChange=oc optionToString enabled />
    }
    <Filter label="Rarity" filter onChange makeFilterComp />
  }
}

module SpectralTypeFilter = {
  @react.component
  let make = (~filter, ~onChange) => {
    let makeFilterComp = (v, oc, enabled) => {
      let optionToString = (option: SpectralType.t) => (option :> string)
      let options: array<SpectralType.t> = [#C, #CI, #CIS, #CM, #CMS, #CS, #I, #M, #S, #SI, #SM]

      <ListSelect options selected=v onChange=oc optionToString enabled />
    }
    <Filter label="Spectral types" filter onChange makeFilterComp />
  }
}

module SizeFilter = {
  @react.component
  let make = (~filter, ~onChange) => {
    let makeFilterComp = (v, oc, enabled) => {
      let optionToString = EnumUtils.sizeToString
      let options: array<Fragments.AsteroidSize.t_size> = [#SMALL, #MEDIUM, #LARGE, #HUGE]
      <ListSelect options selected=v onChange=oc optionToString enabled />
    }

    <Filter label="Size" filter onChange makeFilterComp />
  }
}

module OwnersFilter = {
  @react.component
  let make = (~filter, ~onChange) => {
    let makeFilterComp = (v, oc, enabled) => {
      let value = v->Array.get(0)->Option.getWithDefault("")
      let handleChange = e => {
        let address = ReactEvent.Form.currentTarget(e)["value"]
        oc([address])
      }
      <input type_="text" value onChange=handleChange disabled={!enabled} />
    }
    <Filter label="Owner" filter onChange makeFilterComp />
  }
}

module Buttons = {
  @react.component
  let make = (~onApply, ~onReset) =>
    <div className="flex flex-row space-x-5 ">
      <button type_="submit" onClick={_ => onApply()}>
        <Icon kind={Icon.Fas("check")} text="Apply" />
      </button>
      <button onClick={_ => onReset()}> <Icon kind={Icon.Fas("times")} text="Reset" /> </button>
    </div>
}

module FilterCategory = {
  @react.component
  let make = (~children, ~title, ~isOpen, ~onOpenChange, ~isActive, ~autoLayout=true) =>
    <CollapsibleContent
      className={autoLayout ? "flex flex-row flex-wrap -ml-5" : ""}
      titleComp={<h3 className={isActive ? "italic" : ""}> {title->React.string} </h3>}
      isOpen
      onOpenChange>
      {switch autoLayout {
      | true => children->React.Children.map(c => <div className="pr-5 pl-5 pb-3"> c </div>)
      | false => children
      }}
    </CollapsibleContent>
}

module BonusesFilter = {
  type bonusType = Fragments.AsteroidBonuses.t_bonuses_type
  module BonusCondition = {
    @react.component
    let make = (~condition: AsteroidBonusFilter.Condition.t, ~onChange, ~onClose) => {
      let optionToString = o =>
        switch o {
        | None => "all"
        | Some(t) => EnumUtils.bonusTypeToString(t)
        }
      let optionFromString = s =>
        switch s {
        | "all" => None
        | _ => EnumUtils.bonusTypeFromString(s)
        }
      let options = [
        ("all", "All types"),
        (EnumUtils.bonusTypeToString(#YIELD), "Yield"),
        (EnumUtils.bonusTypeToString(#VOLATILE), "Volatile"),
        (EnumUtils.bonusTypeToString(#METAL), "Metals"),
        (EnumUtils.bonusTypeToString(#ORGANIC), "Organic"),
        (EnumUtils.bonusTypeToString(#FISSILE), "Fissile"),
        (EnumUtils.bonusTypeToString(#RARE_EARTH), "Rare Earth"),
      ]
      let levels = switch condition.type_ {
      | Some(#FISSILE) | Some(#RARE_EARTH) =>
        <span className="italic"> {"Has only one level"->React.string} </span>
      | _ =>
        <ListSelect
          options={[1, 2, 3]}
          optionToString={Int.toString}
          selected={condition.levels}
          onChange={levels => onChange({...condition, levels: levels})}
          enabled={true}
        />
      }
      <div className="flex flex-col space-y-3">
        <div className="flex flex-row space-x-5">
          <Common.Select
            value=condition.type_
            onChange={type_ => onChange({...condition, type_: type_})}
            options
            toString=optionToString
            fromString=optionFromString
          />
          <div className="flex flex-grow justify-end">
            <button className="hover:bg-gray-dark" onClick={_ => onClose()}>
              <Icon kind={Icon.Fas("trash")} />
            </button>
          </div>
        </div>
        levels
      </div>
    }
  }

  @react.component
  let make = (~filters, ~onChange: t => unit) => {
    module Mode = AsteroidBonusFilter.Mode
    module Condition = AsteroidBonusFilter.Condition
    let updateBonuses = f =>
      onChange({
        ...filters,
        bonuses: {
          ...filters.bonuses,
          value: f(filters.bonuses.value),
        },
      })
    let onModeChange = mode =>
      updateBonuses(b => {
        ...b,
        mode: mode,
      })

    let conditionCount = filters.bonuses.value.conditions->Array.length
    React.useEffect1(() => {
      onChange({
        ...filters,
        bonuses: {
          ...filters.bonuses,
          active: conditionCount > 0,
        },
      })
      None
    }, [conditionCount])

    let currentMode = filters.bonuses.value.mode
    let options = [(Mode.toString(#AND), "Match all"), (Mode.toString(#OR), "Match some")]
    let modeSelect =
      <Common.Select
        value=currentMode
        onChange=onModeChange
        options
        toString={m => m->Mode.toString}
        fromString={s => s->Mode.fromString->Option.getWithDefault(#AND)}
      />
    let isActive = filters.bonuses.active && conditionCount > 0
    let (isOpen, setOpen) = React.useState(() => false)
    let addCondition = () =>
      updateBonuses(b => {
        ...b,
        conditions: b.conditions->Array.concat([
          {
            Condition.type_: None,
            levels: [],
          },
        ]),
      })
    let removeCondition = index =>
      updateBonuses(b => {
        ...b,
        conditions: b.conditions->Array.keepWithIndex((_, i) => i !== index),
      })

    let updateCondition = (newCondition, index) =>
      updateBonuses(b => {
        ...b,
        conditions: b.conditions->Array.mapWithIndex((i, c) =>
          switch index == i {
          | true => newCondition
          | false => c
          }
        ),
      })

    <FilterCategory
      title="Bonuses" isActive isOpen onOpenChange={o => setOpen(_ => o)} autoLayout={false}>
      <div className="flex flex-col space-y-3 mt-1">
        <div className="flex flex-row space-x-5">
          {modeSelect}
          <button onClick={_ => addCondition()}>
            <Icon kind={Icon.Fas("plus")} breakpoint={Icon.None} text="Add" />
          </button>
        </div>
        <div className="flex flex-row flex-wrap">
          {filters.bonuses.value.conditions
          ->Array.mapWithIndex((index, condition) =>
            <div className="py-2 pr-4">
              <div key={Int.toString(index)} className="bg-gray rounded-2xl p-4 h-full">
                <BonusCondition
                  condition
                  onChange={updateCondition(_, index)}
                  onClose={() => removeCondition(index)}
                />
              </div>
            </div>
          )
          ->React.array}
        </div>
      </div>
    </FilterCategory>
  }
}

module GeneralFilters = {
  @react.component
  let make = (~filters, ~onChange: t => unit) => {
    let isActive =
      [
        filters.owned.active,
        filters.owners.active,
        filters.scanned.active,
        filters.spectralTypes.active,
        filters.rarities.active,
      ]->Array.some(a => a)
    let (isOpen, setOpen) = React.useState(() => false)

    <FilterCategory title="General" isActive isOpen onOpenChange={o => setOpen(_ => o)}>
      <BoolFilter
        filter=filters.owned
        onChange={owned => onChange({...filters, owned: owned})}
        label="Ownership"
        trueText="Owned"
        falseText="Unowned"
      />
      <OwnersFilter
        filter=filters.owners onChange={owners => onChange({...filters, owners: owners})}
      />
      <BoolFilter
        filter=filters.scanned
        onChange={scanned => onChange({...filters, scanned: scanned})}
        label="Scanned"
        trueText="Yes"
        falseText="No"
      />
      <RaritiesFilter
        filter=filters.rarities onChange={rarities => onChange({...filters, rarities: rarities})}
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
    let priceBounds = PriceBounds.Context.use()

    let (currency, exchangeRates) = ExchangeRates.Context.useWithCurrency()
    let convert = p => p->ExchangeRates.convert(exchangeRates, currency)

    let isActive =
      [
        filters.radius.active,
        filters.surfaceArea.active,
        filters.estimatedPrice.active,
        filters.sizes.active,
      ]->Array.some(a => a)

    let (isOpen, setOpen) = React.useState(_ => isActive)
    let priceLabel = `Estimated price (${currency->Currency.toSymbol})`
    let formatPrice = p => p->convert->Format.price(currency, ~showSymbol=false)

    <FilterCategory title="Size" isActive isOpen onOpenChange={o => setOpen(_ => o)}>
      <NumberRangeFilter
        filter=filters.radius
        onChange={radius => onChange({...filters, radius: radius})}
        label="Radius (m)"
        bounds=Defaults.radiusBounds
        step=NumberRangeFilter.Log
        formatValue=Format.radius
      />
      <NumberRangeFilter
        filter=filters.surfaceArea
        onChange={surfaceArea => onChange({...filters, surfaceArea: surfaceArea})}
        label=`Surface area (km²)`
        bounds=Defaults.surfaceBounds
        step=NumberRangeFilter.Log
        formatValue=Format.surfaceArea
      />
      {switch priceBounds {
      | None => React.null
      | Some({Queries.PriceBounds.min: min, max}) =>
        <NumberRangeFilter
          filter=filters.estimatedPrice
          onChange={estimatedPrice => onChange({...filters, estimatedPrice: estimatedPrice})}
          label=priceLabel
          bounds={(min, max)}
          step=NumberRangeFilter.Log
          formatValue=formatPrice
        />
      }}
      <SizeFilter filter=filters.sizes onChange={sizes => onChange({...filters, sizes: sizes})} />
    </FilterCategory>
  }
}

module OrbitalFilters = {
  @react.component
  let make = (~filters, ~onChange: t => unit) => {
    let isActive =
      [
        filters.semiMajorAxis.active,
        filters.inclination.active,
        filters.orbitalPeriod.active,
        filters.eccentricity.active,
      ]->Array.some(a => a)

    let (isOpen, setOpen) = React.useState(_ => false)

    <FilterCategory title="Orbitals" isActive isOpen onOpenChange={o => setOpen(_ => o)}>
      <NumberRangeFilter
        filter=filters.semiMajorAxis
        onChange={semiMajorAxis => onChange({...filters, semiMajorAxis: semiMajorAxis})}
        label="Semi major axis (AU)"
        bounds=Defaults.semiMajorAxisBounds
        step=NumberRangeFilter.Static(0.001)
        formatValue=Format.semiMajorAxis
      />
      <NumberRangeFilter
        filter=filters.inclination
        onChange={inclination => onChange({...filters, inclination: inclination})}
        label="Inclination (degrees)"
        bounds=Defaults.inclinationBounds
        step=NumberRangeFilter.Static(0.01)
        formatValue=Format.inclination
      />
      <NumberRangeFilter
        filter=filters.orbitalPeriod
        onChange={orbitalPeriod => onChange({...filters, orbitalPeriod: orbitalPeriod})}
        label="Orbital period (days)"
        bounds=Defaults.orbitalPeriodBounds
        step=NumberRangeFilter.Static(1.)
        formatValue=Format.orbitalPeriod
      />
      <NumberRangeFilter
        filter=filters.eccentricity
        onChange={eccentricity => onChange({...filters, eccentricity: eccentricity})}
        label="Eccentricity"
        bounds=Defaults.eccentricityBounds
        step=NumberRangeFilter.Static(0.001)
        formatValue=Format.eccentricity
      />
    </FilterCategory>
  }
}

@react.component
let make = (~className="", ~filters, ~onChange, ~onApply, ~onReset) => {
  let (filtersVisible, setFiltersVisible) = React.useState(() => false)
  let active = filters->isActive
  <CollapsibleContent
    className
    titleComp={<h2 className={active ? "italic" : ""}> {"Filters"->React.string} </h2>}
    isOpen=filtersVisible
    onOpenChange={isOpen => setFiltersVisible(_ => isOpen)}>
    <form className="flex flex-col space-y-3 mb-3" onSubmit={ReactEvent.Form.preventDefault}>
      <GeneralFilters filters onChange />
      <BonusesFilter filters onChange />
      <SizeFilters filters onChange />
      <OrbitalFilters filters onChange />
      <Buttons onApply onReset />
    </form>
  </CollapsibleContent>
}

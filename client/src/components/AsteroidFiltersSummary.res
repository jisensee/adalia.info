open Belt

type formatter<'a> = Str('a => string) | Element('a => React.element)

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
  let radius = range(_, ~unit="m", ~formatValue=Format.radius)
  let surfaceArea = range(_, ~unit=`km²`, ~formatValue=Format.surfaceArea)
  let orbitalPeriod = range(_, ~unit="days", ~formatValue=Format.orbitalPeriod)
  let semiMajorAxis = range(_, ~unit="AU", ~formatValue=Format.semiMajorAxis)
  let inclination = range(_, ~unit=`°`, ~formatValue=Format.inclination)
  let eccentricity = range(_, ~formatValue=Format.eccentricity)
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

@react.component
let make = (~className="", ~readonly=false) => {
  module Filter = AsteroidFilters.Filter
  let {currency} = Currency.Store.use()
  let {filters, setFilters} = AsteroidFilters.Store.use()

  module FilterTag = {
    @react.component
    let make = (~filter, ~prefix, ~formatter, ~onClose) =>
      switch filter.Filter.active {
      | true =>
        <Vechai.Tag
          className="!border-primary-std flex flex-row space-x-3 mr-2 mb-2" key=prefix size={#xl}>
          <Vechai.Tag.Label className="text-ellipsis">
            <span className="text-primary-std"> {React.string(prefix ++ ": ")} </span>
            {switch formatter {
            | Str(f) => filter.value->f->React.string
            | Element(f) => filter.value->f
            }}
          </Vechai.Tag.Label>
          {switch readonly {
          | true => React.null
          | false =>
            <div className="cursor-pointer hover:text-primary-std" onClick={_ => onClose()}>
              <Icon kind={Icon.Fas("times")} />
            </div>
          }}
        </Vechai.Tag>
      | false => React.null
      }
  }

  let formatOwners = owners => {
    let address = owners->Array.get(0)->Option.getWithDefault("")
    <AsteroidOwner address shortAddress={true} />
  }
  let disableFilter = AsteroidFilters.Filter.disable

  <div className={`flex flex-row flex-wrap items-center -mb-2 ${className}`}>
    <FilterTag
      filter=filters.owned
      prefix="Owned"
      formatter={Str(FilterFormatter.owned)}
      onClose={() => setFilters({...filters, AsteroidFilters.owned: filters.owned->disableFilter})}
    />
    <FilterTag
      filter=filters.owners
      prefix="Owner"
      formatter={Element(formatOwners)}
      onClose={() =>
        setFilters({...filters, AsteroidFilters.owners: filters.owners->disableFilter})}
    />
    <FilterTag
      filter=filters.scanned
      prefix="Scanned"
      formatter={Str(FilterFormatter.scanned)}
      onClose={() =>
        setFilters({...filters, AsteroidFilters.scanned: filters.scanned->disableFilter})}
    />
    <FilterTag
      filter=filters.spectralTypes
      prefix="Spectral types"
      formatter={Str(FilterFormatter.spectralTypes)}
      onClose={() =>
        setFilters({
          ...filters,
          AsteroidFilters.spectralTypes: filters.spectralTypes->disableFilter,
        })}
    />
    <FilterTag
      filter=filters.radius
      prefix="Radius"
      formatter={Str(FilterFormatter.radius)}
      onClose={() =>
        setFilters({...filters, AsteroidFilters.radius: filters.radius->disableFilter})}
    />
    <FilterTag
      filter=filters.sizes
      prefix="Sizes"
      formatter={Str(FilterFormatter.sizes)}
      onClose={() => setFilters({...filters, AsteroidFilters.sizes: filters.sizes->disableFilter})}
    />
    <FilterTag
      filter=filters.surfaceArea
      prefix="Surface area"
      formatter={Str(FilterFormatter.surfaceArea)}
      onClose={() =>
        setFilters({...filters, AsteroidFilters.surfaceArea: filters.surfaceArea->disableFilter})}
    />
    <FilterTag
      filter=filters.orbitalPeriod
      prefix="Orbital period"
      formatter={Str(FilterFormatter.orbitalPeriod)}
      onClose={() =>
        setFilters({
          ...filters,
          AsteroidFilters.orbitalPeriod: filters.orbitalPeriod->disableFilter,
        })}
    />
    <FilterTag
      filter=filters.semiMajorAxis
      prefix="Semi major axis"
      formatter={Str(FilterFormatter.semiMajorAxis)}
      onClose={() =>
        setFilters({
          ...filters,
          AsteroidFilters.semiMajorAxis: filters.semiMajorAxis->disableFilter,
        })}
    />
    <FilterTag
      filter=filters.inclination
      prefix="Inclination"
      formatter={Str(FilterFormatter.inclination)}
      onClose={() =>
        setFilters({...filters, AsteroidFilters.inclination: filters.inclination->disableFilter})}
    />
    <FilterTag
      filter=filters.eccentricity
      prefix="Eccentricity"
      formatter={Str(FilterFormatter.eccentricity)}
      onClose={() =>
        setFilters({...filters, AsteroidFilters.eccentricity: filters.eccentricity->disableFilter})}
    />
    <FilterTag
      filter=filters.estimatedPrice
      prefix="Last sale price"
      formatter={Str(FilterFormatter.price(_, currency))}
      onClose={() =>
        setFilters({
          ...filters,
          AsteroidFilters.estimatedPrice: filters.estimatedPrice->disableFilter,
        })}
    />
    <FilterTag
      filter=filters.rarities
      prefix="Owned"
      formatter={Str(FilterFormatter.rarities)}
      onClose={() =>
        setFilters({...filters, AsteroidFilters.rarities: filters.rarities->disableFilter})}
    />
    <FilterTag
      filter=filters.bonuses
      prefix="Bonuses"
      formatter={Str(FilterFormatter.bonuses)}
      onClose={() =>
        setFilters({...filters, AsteroidFilters.bonuses: filters.bonuses->disableFilter})}
    />
  </div>
}

@react.component
let make = (~iconBreakpoint=?) => {
  let {filters, setFilters} = AsteroidFilters.Store.use()

  module FilterButton = {
    @react.component
    let make = (~text, ~action) =>
      <Vechai.Button className="justify-start" onClick={_ => action()}>
        <Icon kind={Icon.Fas("filter")} text />
      </Vechai.Button>
  }
  module Filter = AsteroidFilters.Filter
  module Popover = Common.Popover

  <div className="z-20">
    <Popover className="relative">
      <Popover.Button _as={React.Fragment.make}>
        <Vechai.Button className="btn-inverted" size={#lg}>
          <Icon kind={Icon.Fas("filter")} breakpoint=?iconBreakpoint text="Quick Filters" />
        </Vechai.Button>
      </Popover.Button>
      <Common.Transitions.Appear>
        <Popover.Panel className="absolute z-50 mt-3 bg-base rounded-2xl">
          <div className="flex flex-col space-y-3 border-primary-std border p-2 rounded-2xl">
            <Vechai.Button
              className="btn-inverted justify-start !border-red"
              size={#md}
              onClick={_ => setFilters(AsteroidFilters.defaultFilters)}>
              <Icon kind={Icon.Fas("filter-circle-xmark")} text="Reset all" />
            </Vechai.Button>
            <FilterButton
              text="Owned"
              action={() =>
                setFilters({
                  ...filters,
                  AsteroidFilters.owned: Filter.makeActive(true),
                })}
            />
            <FilterButton
              text="Scanned"
              action={() =>
                setFilters({
                  ...filters,
                  AsteroidFilters.scanned: Filter.makeActive(true),
                })}
            />
            <FilterButton
              text="Incomparable"
              action={() =>
                setFilters({
                  ...filters,
                  AsteroidFilters.rarities: Filter.makeActive([#INCOMPARABLE]),
                })}
            />
            <FilterButton
              text="Single-Type"
              action={() =>
                setFilters({
                  ...filters,
                  AsteroidFilters.spectralTypes: Filter.makeActive([#C, #M, #S, #I]),
                })}
            />
            <FilterButton
              text="Multi-Type"
              action={() =>
                setFilters({
                  ...filters,
                  AsteroidFilters.spectralTypes: Filter.makeActive([
                    #CI,
                    #CIS,
                    #CM,
                    #CMS,
                    #CS,
                    #SM,
                  ]),
                })}
            />
            <FilterButton
              text="Yield Bonus"
              action={() =>
                setFilters({
                  ...filters,
                  AsteroidFilters.bonuses: Filter.makeActive({
                    AsteroidBonusFilter.mode: #AND,
                    conditions: [
                      {
                        AsteroidBonusFilter.Condition.type_: Some(#YIELD),
                        levels: [],
                      },
                    ],
                  }),
                })}
            />
          </div>
        </Popover.Panel>
      </Common.Transitions.Appear>
    </Popover>
  </div>
}

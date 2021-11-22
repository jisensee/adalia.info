open ReScriptUrql
open Belt

external convertFilter: AsteroidFilters.queryFilter => Queries.AsteroidStats.t_variables_AsteroidFilterInput =
  "%identity"

module Filter = AsteroidFilters.Filter
let makeFilterVariable = f => f->AsteroidFilters.makeFilterVariable->convertFilter
@react.component
let make = () => {
  let {filters} = AsteroidFilters.Store.use()
  AsteroidFiltersQueryParams.use()
  let ({Hooks.response: response}, _) = Hooks.useQuery(
    ~query=module(Queries.AsteroidStats),
    {
      filter: makeFilterVariable(filters)->Some,
    },
  )

  switch response {
  | Data({asteroidStats}) => {
      let charts = [
        <RaritiesChart
          className="md:w-[30rem]"
          counts={asteroidStats.byRarity}
          totalCount={asteroidStats.basicStats.count}
        />,
        <SpectralTypesChart
          className="md:w-[30rem]"
          counts={asteroidStats.bySpectralType}
          totalCount={asteroidStats.basicStats.count}
        />,
      ]
      <>
        <div className="flex flex-row">
          <h1 className="flex-grow"> {"Asteroid stats"->React.string} </h1>
          <AsteroidQuickFilters iconBreakpoint={Icon.Sm} />
        </div>
        <AsteroidFiltersSummary />
        <BasicStatsChart basicStats={asteroidStats.basicStats} />
        <div className="flex flex-row flex-wrap justify-center gap-x-10 gap-y-5">
          {charts
          ->Array.mapWithIndex((i, c) =>
            <div key={Int.toString(i)} className="w-full md:w-[30rem]"> {c} </div>
          )
          ->React.array}
        </div>
      </>
    }
  | _ => React.null
  }
}

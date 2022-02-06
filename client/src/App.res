open ReScriptUrql

type versionInfo = {version: string}
@module external versionInfo: versionInfo = "../version"

let useLastDataUpdate = () => {
  let ({Hooks.response: response}, _) = Hooks.useQuery(~query=module(Queries.LastDataUpdateAt), ())
  switch response {
  | Data(d) => d.lastDataUpdateAt
  | _ => None
  }
}

@react.component
let make = () => {
  let route = RescriptReactRouter.useUrl()->Route.fromUrl
  let pageComp = route->Pages.fromRoute
  let showAsteroidFilters = route->Route.hasAsteroidFilters
  let linkRelease = versionInfo.version !== "dev"
  let priceBounds = PriceBounds.useState()
  let lastDataUpdateAt = useLastDataUpdate()

  ExchangeRates.useUpdater()

  let sidebar = if showAsteroidFilters {
    <AsteroidFilters className="shrink-0" />
  } else {
    React.null
  }

  <QueryParams.Provider history=QueryParams.history>
    <Vechai.Provider theme={Vechai.theme} colorScheme={Vechai.defaultColorScheme}>
      <PriceBounds.Context.Provider value=priceBounds>
        <div className="flex flex-col h-full">
          <Navbar className="sticky top-0 z-40" />
          <div className="flex flex-row space-x-1 h-full overflow-y-hidden">
            {sidebar}
            <div className="p-4 flex flex-col space-y-5 flex-grow overflow-y-auto">
              {pageComp} <Footer version=versionInfo.version linkRelease ?lastDataUpdateAt />
            </div>
          </div>
        </div>
      </PriceBounds.Context.Provider>
    </Vechai.Provider>
  </QueryParams.Provider>
}

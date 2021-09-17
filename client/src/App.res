open ReScriptUrql

type versionInfo = {version: string}
@module external versionInfo: versionInfo = "../version"

@react.component
let make = () => {
  let ({Hooks.response: response}, _) = Hooks.useQuery(~query=module(Queries.LastDataUpdateAt), ())
  let lastDataUpdateAt: option<Js.Date.t> = switch response {
  | Data(d) => d.lastDataUpdateAt
  | _ => None
  }
  let pageComp = RescriptReactRouter.useUrl()->Route.fromUrl->Pages.fromRoute
  let linkRelease = versionInfo.version !== "dev"
  let (currency, setCurrency) = Currency.useState()
  let exchangeRates = ExchangeRates.useState()
  let priceBounds = PriceBounds.useState()

  <>
    <PriceBounds.Context.Provider value=priceBounds>
      <ExchangeRates.Context.Provider value=exchangeRates>
        <Currency.Context.Provider value=currency>
          <Navbar className="sticky top-0 z-40" setCurrency />
          <div className="md:container md:mx-auto p-4"> {pageComp} </div>
          <Footer version=versionInfo.version linkRelease ?lastDataUpdateAt />
        </Currency.Context.Provider>
      </ExchangeRates.Context.Provider>
    </PriceBounds.Context.Provider>
  </>
}

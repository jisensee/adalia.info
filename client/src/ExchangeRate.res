type t = {oneEthInUsd: float}

let priceUrl = "https://api.etherscan.io/api?module=stats&action=ethprice"
type priceResult = {"result": {"ethusd": string}}

let getExchangeRate = () =>
  Fetch.fetch(priceUrl)
  ->Promise.then(Fetch.Response.text)
  ->Promise.thenResolve(Js.Json.deserializeUnsafe)
  ->Promise.thenResolve(r => {
    r["result"]["ethusd"]
    ->Belt.Float.fromString
    ->Belt.Option.map(oneEthInUsd => {
      oneEthInUsd: oneEthInUsd,
    })
  })
  ->Promise.catch(_ => Promise.resolve(None))

module Context = {
  let context = React.createContext((None: option<t>))

  module Provider = {
    let provider = React.Context.provider(context)

    @react.component
    let make = (~value, ~children) =>
      React.createElement(provider, {"value": value, "children": children})
  }

  let use = () => React.useContext(context)
  let useWithCurrency = () => (Currency.Context.use(), use())
}

let convertAndFormat = (price, exchangeRate, targetCurrency) =>
  switch (exchangeRate, targetCurrency) {
  | (None, _) => price

  | (Some(rate), Currency.ETH) => price *. (1. /. rate.oneEthInUsd)

  | (Some(_), Currency.USD) => price
  }->Format.price(targetCurrency)

let useState = () => {
  let (rate: option<t>, setRate) = React.useState(() => None)

  React.useEffect0(() => {
    let updateRate = () =>
      getExchangeRate()->Promise.thenResolve(rate => setRate(_ => rate))->ignore
    updateRate()
    Bindings.Interval.run(updateRate, 60 * 60 * 1000)
    None
  })
  rate
}

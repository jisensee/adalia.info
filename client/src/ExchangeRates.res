type t = Queries.ExchangeRates.t_exchangeRates

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

let convert = (price, exchangeRate, targetCurrency) =>
  switch (exchangeRate, targetCurrency) {
  | (None, _) => price
  | (Some(_), Currency.ETH) => price
  | (Some(rate), Currency.USD) => price *. rate.Queries.ExchangeRates.oneEthInUsd
  }

let convertAndFormat = (~showSymbol=?, price, exchangeRate, targetCurrency) =>
  price->convert(exchangeRate, targetCurrency)->Format.price(targetCurrency, ~showSymbol?)

let useState = () => {
  open ReScriptUrql
  let ({Hooks.response: response}, refreshRates) = Hooks.useQuery(
    ~query=module(Queries.ExchangeRates),
    (),
  )

  React.useEffect0(() => {
    let tenMinutes = 10 * 60 * 1000
    Bindings.Interval.run(() => refreshRates(), tenMinutes)
    None
  })

  switch response {
  | Data({exchangeRates}) => Some(exchangeRates)
  | _ => None
  }
}

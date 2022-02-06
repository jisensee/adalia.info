type t = Queries.ExchangeRates.t_exchangeRates

let convert = (price, exchangeRate, targetCurrency) =>
  switch (exchangeRate, targetCurrency) {
  | (None, _) => price
  | (Some(_), Currency.ETH) => price
  | (Some(rate), Currency.USD) => price *. rate.Queries.ExchangeRates.oneEthInUsd
  }

let convertAndFormat = (~showSymbol=?, price, exchangeRate, targetCurrency) =>
  price->convert(exchangeRate, targetCurrency)->Format.price(targetCurrency, ~showSymbol?)

module Store = {
  type state = {
    exchangeRates: option<t>,
    setExchangeRates: t => unit,
  }

  let use = Zustand.create(set => {
    exchangeRates: None,
    setExchangeRates: rate => set(state => {
        ...state,
        exchangeRates: Some(rate),
      }, false),
  })
}

let useUpdater = () => {
  open ReScriptUrql
  let {setExchangeRates} = Store.use()
  let ({Hooks.response: response}, refreshRates) = Hooks.useQuery(
    ~query=module(Queries.ExchangeRates),
    (),
  )
  React.useEffect0(() => {
    let tenMinutes = 10 * 60 * 1000
    Bindings.Interval.run(() => refreshRates(), tenMinutes)
    None
  })

  React.useEffect1(() => {
    switch response {
    | Data({exchangeRates}) => setExchangeRates(exchangeRates)
    | _ => ()
    }
    None
  }, [response])
}

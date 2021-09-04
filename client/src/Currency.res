type t = USD | ETH
let toString = c =>
  switch c {
  | USD => "USD"
  | ETH => "ETH"
  }

let fromString = s =>
  switch s {
  | "ETH" => Some(ETH)
  | "USD" => Some(USD)
  | _ => None
  }

module LocalStorage = {
  let key = "currency"

  let get = () => Bindings.LocalStorage.get(key)->Belt.Option.flatMap(fromString)
  let set = value => Bindings.LocalStorage.set(~key, ~value=value->toString)
}

let currencyKey = "currency"
let default = USD
let initial = LocalStorage.get()->Belt.Option.getWithDefault(default)

module Context = {
  let context = React.createContext(default)

  module Provider = {
    let provider = React.Context.provider(context)

    @react.component
    let make = (~value, ~children) =>
      React.createElement(provider, {"value": value, "children": children})
  }

  let use = () => React.useContext(context)
}

let useState = () => {
  let (currency, setCurrency) = React.useState(() => initial)

  let updateCurrency = c => {
    setCurrency(_ => c)
    LocalStorage.set(c)
  }
  (currency, updateCurrency)
}

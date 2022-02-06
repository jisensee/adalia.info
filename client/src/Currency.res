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

let toSymbol = c =>
  switch c {
  | USD => "$"
  | ETH => `ETH`
  }

module LocalStorage = {
  let key = "currency"

  let get = () => Bindings.LocalStorage.get(key)->Belt.Option.flatMap(fromString)
  let set = value => Bindings.LocalStorage.set(~key, ~value=value->toString)
}

let default = USD
let initial = LocalStorage.get()->Belt.Option.getWithDefault(default)

module Store = {
  type state = {
    currency: t,
    setCurrency: t => unit,
  }

  let use = Zustand.create(set => {
    currency: initial,
    setCurrency: c => set(state => {
        LocalStorage.set(c)
        {
          ...state,
          currency: c,
        }
      }, false),
  })
}

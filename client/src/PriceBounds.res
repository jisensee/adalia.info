open ReScriptUrql

type t = Queries.PriceBounds.t_priceBounds

module Context = {
  let context = React.createContext((None: option<t>))

  module Provider = {
    let provider = React.Context.provider(context)

    @react.component
    let make = (~value, ~children) =>
      React.createElement(provider, {"value": value, "children": children})
  }

  let use = () => React.useContext(context)
}

let useState = () => {
  let ({Hooks.response: response}, _) = Hooks.useQuery(~query=module(Queries.PriceBounds), ())
  switch response {
  | Data({priceBounds}) => Some(priceBounds)
  | _ => None
  }
}

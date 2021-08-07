open ReScriptUrql
open Belt

module Page = {
  @react.component
  let make = (~id) => {
    let ({Hooks.response: response}, _) = Hooks.useQuery(~query=module(Queries.Asteroid), {id: id})

    switch response {
    | Data({asteroid: maybeAsteroid}) =>
      maybeAsteroid->Option.mapWithDefault(<NotFoundPage />, asteroid =>
        <AsteroidDetails asteroid />
      )
    | _ => React.null
    }
  }
}

@react.component
let make = (~id) => {
  id->Int.fromString->Option.mapWithDefault(<NotFoundPage />, intId => <Page id=intId />)
}

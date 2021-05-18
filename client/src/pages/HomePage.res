open ReScriptUrql

@react.component
let make = () => {
  let ({Hooks.response: response}, _) = Hooks.useQuery(
    ~query=module(Queries.AsteroidCount),
    {filter: Some({owned: Some(true), spectralTypes: None})},
  )
  <>
    <h1> {"Home"->React.string} </h1>
    {switch response {
    | Data({asteroidCount}) =>
      <ProgressBar
        count=asteroidCount.count total=asteroidCount.total prefixText="Owned asteroids: "
      />
    | _ => React.null
    }}
  </>
}

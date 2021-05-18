open ReScriptUrql

@react.component
let make = () => {
  let ({Hooks.response: response}, _) = Hooks.useQuery(
    ~query=module(Queries.AsteroidCount),
    {filter: Some({owned: Some(true), spectralTypes: None})},
  )
  <>
    <h1> {"Home"->React.string} </h1>
    <p>
      {"Welcome to adalia.info, a hub for all things regarding "->React.string}
      <Link to_=Link.influenceGame text="Influence" />
      {", a space strategy MMO built on the Ethereum blockchain."->React.string}
      <br />
      {"This site is work in progress, there are many features to come. The project is 100% open-source, check it out on "->React.string}
      <Link to_=Link.githubRepo text="Github" />
      {"."->React.string}
      <br />
      {"For the start, you can head over to the "->React.string}
      <Link to_=Link.Internal(Route.defaultAsteroidsRoute) text="asteroids page" />
      {" to view, sort and filter all asteroids in the game."->React.string}
    </p>
    {switch response {
    | Data({asteroidCount}) =>
      <ProgressBar
        count=asteroidCount.count total=asteroidCount.total prefixText="Owned asteroids: "
      />
    | _ => React.null
    }}
  </>
}

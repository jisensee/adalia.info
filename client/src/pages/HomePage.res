open ReScriptUrql

@react.component
let make = () => {
  let ({Hooks.response: response}, _) = Hooks.useQuery(
    ~query=module(Queries.AsteroidCount),
    {filter: Some({owned: Some(true), spectralTypes: None, radius: None})},
  )
  <>
    <h1> {"Home"->React.string} </h1>
    <p>
      {"Welcome to "->React.string}
      <span className="text-cyan"> {"adalia.info"->React.string} </span>
      {", a community-driven hub for all things regarding "->React.string}
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
    <p>
      <span className="font-bold"> {"Disclaimer: "->React.string} </span>
      {"This project is run by the community and is not directly affiliated with the developers. It does however use the official Influence-API to retrieve game-specific up-to-date data."->React.string}
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

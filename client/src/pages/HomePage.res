open ReScriptUrql

@react.component
let make = () => {
  let ({Hooks.response: response}, _) = Hooks.useQuery(
    ~query=module(Queries.AsteroidStats),
    {
      filter: None,
    },
  )
  <>
    <h1> {"Home"->React.string} </h1>
    <p>
      {"Welcome to "->React.string}
      <Link to_={Link.Internal(Route.Home)} text="adalia.info" />
      {", a community-driven hub for all things regarding "->React.string}
      <Link to_=Link.influenceGame text="Influence" />
      {", a space strategy MMO built on the Ethereum blockchain."->React.string}
      <br />
      {"This site is work in progress, there are many features to come. The project is 100% open-source, check it out on "->React.string}
      <Link to_=Link.githubRepo text="Github" />
      {"."->React.string}
      <br />
      {"For the start, you can head over to the "->React.string}
      <Link to_=Link.Internal(Route.Asteroids) text="asteroids page" />
      {" to view, sort and filter all asteroids in the game."->React.string}
    </p>
    <p>
      <span className="font-bold"> {"Disclaimer: "->React.string} </span>
      {"This project is run by the community and is not directly affiliated with the developers. It does however use the official Influence-API to retrieve game-specific up-to-date data."->React.string}
    </p>
    {switch response {
    | Data({asteroidStats}) => {
        open Belt
        let value = asteroidStats.basicStats.owned->Int.toFloat
        let max = 250_000.

        <ProgressBar
          value
          max
          textConfigs={ProgressBar.defaultTextConfigs(
            ~title="Owned asteroids",
            ~value,
            ~max,
            ~formatValue=Format.formatFloat(_, 0),
            ~formatMax=Format.bigFloat,
            (),
          )}
        />
      }
    | _ => React.null
    }}
  </>
}

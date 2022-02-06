open ReScriptUrql

@react.component
let make = () => {
  let ({Hooks.response: response}, _) = Hooks.useQuery(
    ~query=module(Queries.AsteroidCount),
    {
      filter: Some({
        owned: Some(true),
        owners: None,
        scanned: None,
        spectralTypes: None,
        radius: None,
        surfaceArea: None,
        sizes: None,
        orbitalPeriod: None,
        semiMajorAxis: None,
        inclination: None,
        eccentricity: None,
        estimatedPrice: None,
        rarities: None,
        bonuses: None,
      }),
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
    | Data({asteroidCount}) => {
        open Belt
        let count = asteroidCount.count->Int.toFloat
        let total = asteroidCount.total->Int.toFloat
        let percentage = (count /. total *. 100.)->Format.formatFloat(1) ++ "%"
        let formattedCount = count->Format.formatFloat(0)
        let formattedTotal = total->Format.bigFloat

        module Pb = ProgressBar
        let textConfigs = [
          {
            Pb.className: "xs:hidden",
            content: `Owned Asteroids: ${formattedCount}`,
          },
          {
            Pb.className: "hidden xs:inline sm:hidden",
            content: `Owned asteroids: ${formattedCount} (${percentage})`,
          },
          {
            Pb.className: "hidden sm:inline",
            content: `Owned asteroids: ${formattedCount} / ${formattedTotal} (${percentage})`,
          },
        ]
        <ProgressBar count=asteroidCount.count total=asteroidCount.total textConfigs />
      }
    | _ => React.null
    }}
  </>
}

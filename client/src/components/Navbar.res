module Item = {
  @react.component
  let make = (~to_, ~children, ~className="", ~highlight=true, ~bold=false) =>
    <li className={className ++ " text-xl"}> <Link to_ highlight bold> {children} </Link> </li>
}
@react.component
let make = () =>
  <nav className="bg-gray-800 p-2">
    <div className="container mx-auto flex flex-row">
      <ul className="flex flex-row items-center space-x-9 flex-grow">
        <Item to_=Link.Internal(Route.Home) bold=true className="text-2xl">
          <Icon kind={Icon.Fas("sun")}> {"adalia.info"->React.string} </Icon>
        </Item>
        <Item to_=Link.Internal(Route.defaultAsteroidsRoute)>
          <Icon kind={Icon.Fas("meteor")}> {"Asteroids"->React.string} </Icon>
        </Item>
        <Item to_=Link.Internal(Route.GlobalStats)>
          <Icon kind={Icon.Fas("chart-pie")}> {"Global stats"->React.string} </Icon>
        </Item>
      </ul>
      <ul className="flex flex-row items-center space-x-9 justify-end">
        <Item to_=Link.influence highlight=false>
          <Icon kind={Icon.Custom("influence.png")} />
        </Item>
        <Item to_=Link.githubRepo highlight=false>
          <Icon kind={Icon.Fab("github")} large=true />
        </Item>
      </ul>
    </div>
  </nav>

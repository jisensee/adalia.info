module Item = {
  @react.component
  let make = (~to_, ~children, ~className="", ~highlight=true, ~bold=false) =>
    <li className={className ++ " text-xl"}> <Link to_ highlight bold> {children} </Link> </li>
}
@react.component
let make = (~className="") =>
  <nav className={`bg-gray py-2 ${className}`}>
    <div className="container mx-auto px-4 flex flex-row">
      <ul className="flex flex-row items-center space-x-9 flex-grow">
        <Item to_=Link.Internal(Route.Home) bold=true className="text-2xl">
          <Icon kind={Icon.Fas("sun")}> {"adalia.info"->React.string} </Icon>
        </Item>
        <Item to_=Link.Internal(Route.defaultAsteroidsRoute)>
          <Icon kind={Icon.Fas("meteor")} mobile={true}> {"Asteroids"->React.string} </Icon>
        </Item>
        <Item to_=Link.Internal(Route.GlobalStats)>
          <Icon kind={Icon.Fas("chart-pie")} mobile={true}> {"Global stats"->React.string} </Icon>
        </Item>
      </ul>
      <ul className="flex flex-row items-center space-x-9 justify-end">
        <Item to_=Link.Internal(Route.Support)>
          <Icon kind={Icon.Fas("hands-helping")} mobile={true}> {"Support"->React.string} </Icon>
        </Item>
      </ul>
    </div>
  </nav>

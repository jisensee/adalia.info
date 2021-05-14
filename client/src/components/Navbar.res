module Item = {
  @react.component
  let make = (~to_, ~children, ~className="") =>
    <li className={className ++ " text-xl hover:text-cyan"}> <Link to_> {children} </Link> </li>
}
@react.component
let make = () =>
  <nav className="bg-gray-800 p-2">
    <div className="container mx-auto flex flex-row">
      <ul className="flex flex-row items-center space-x-9 flex-grow">
        <Item to_=Link.Internal(Route.Home) className="text-cyan text-2xl font-bold">
          <Icon kind={Icon.Fas("sun")}> {"adalia.info"->React.string} </Icon>
        </Item>
        <Item to_=Link.Internal(Route.Asteroids({page: None, pageSize: None, sort: None}))>
          <Icon kind={Icon.Fas("meteor")}> {"Asteroids"->React.string} </Icon>
        </Item>
        <Item to_=Link.Internal(Route.GlobalStats)>
          <Icon kind={Icon.Fas("chart-pie")}> {"Global stats"->React.string} </Icon>
        </Item>
      </ul>
      <ul className="flex flex-row items-center space-x-9 justify-end">
        <Item to_=Link.External("https://www.influenceth.io")>
          <Icon kind={Icon.Custom("influence.png")} />
        </Item>
        <Item to_=Link.External("https://github.com/jisensee/adalia.info")>
          <Icon kind={Icon.Fab("github")} large=true />
        </Item>
      </ul>
    </div>
  </nav>

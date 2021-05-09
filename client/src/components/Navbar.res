module Item = {
  @react.component
  let make = (~to_, ~children, ~className="") =>
    <li className={className ++ " text-xl hover:text-cyan"}> <Link to_> {children} </Link> </li>
}
@react.component
let make = () =>
  <nav className="bg-gray-800 p-3">
    <div className="container mx-auto">
      <ul className="flex flex-row space-x-5">
        // Left
        <Item to_=Link.Internal(Route.Asteroids) className="text-cyan font-bold">
          {"adalia.info"->React.string}
        </Item>
        <Item to_=Link.Internal(Route.Asteroids)> {"Asteroids"->React.string} </Item>
        <Item to_=Link.Internal(Route.GlobalStats)> {"Global Stats"->React.string} </Item>
        // Divider in middle
        <div className="flex flex-grow" />
        // Right
        <Item className="float-right" to_=Link.External("https://github.com/jisensee/adalia.info")>
          <Icon showing="github" brand=true large=true />
        </Item>
      </ul>
    </div>
  </nav>

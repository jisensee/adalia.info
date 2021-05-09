module Item = {
  @react.component
  let make = (~to_, ~label, ~className="") =>
    <li className={className ++ " text-xl hover:text-cyan"}>
      <Link to_> {label->React.string} </Link>
    </li>
}
@react.component
let make = () =>
  <nav className="bg-gray-800 p-3">
    <div className="container mx-auto">
      <ul className="flex flex-row space-x-5">
        <Item
          to_=Link.Internal(Route.Asteroids) className="text-cyan font-bold" label="adalia.info"
        />
        <Item to_=Link.Internal(Route.Asteroids) label="Asteroids" />
        <Item to_=Link.Internal(Route.GlobalStats) label="Global Stats" />
        <div className="flex flex-grow" />
        <Item
          className="float-right"
          to_=Link.External("https://github.com/jisensee/adalia.info")
          label="Github"
        />
      </ul>
    </div>
  </nav>

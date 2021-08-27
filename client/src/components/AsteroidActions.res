@react.component
let make = (
  ~className="",
  ~id,
  ~orbitalPeriod,
  ~owned,
  ~actionTextBreakpoint,
  ~showInternalLink=false,
) => {
  let makeAction = (~iconWidth="", link, icon, text) =>
    <button key=text>
      <Link to_=link titleText=text>
        <Icon className=iconWidth kind=icon text breakpoint={actionTextBreakpoint} />
      </Link>
    </button>

  open PageQueryParams.AsteroidPageParamType
  let coorbitalLink = Link.Internal(
    Route.Asteroids({
      pageNum: None,
      pageSize: None,
      sort: None,
      columns: None,
      filters: Some({
        ...emptyFilters,
        orbitalPeriod: Some((
          Js.Math.round(orbitalPeriod -. 1.),
          Js.Math.round(orbitalPeriod +. 1.),
        )),
      }),
    }),
  )
  let actions = [
    switch owned {
    | false => None
    | true => makeAction(Link.makeAsteroidOpenSeaLink(id), Icon.openSea, "OpenSea")->Some
    },
    makeAction(Link.makeGameRoidLink(id), Icon.influence, "Game")->Some,
    makeAction(coorbitalLink, Icon.Fas("globe"), "Co-Orbitals", ~iconWidth="w-6")->Some,
    switch showInternalLink {
    | false => None
    | true => makeAction(Link.Internal(Route.Asteroid(id)), Icon.Fas("meteor"), "Details")->Some
    },
  ]
  <div className={`flex flex-row space-x-3 justify-center ${className}`}>
    {actions->Belt.Array.keepMap(e => e)->React.array}
  </div>
}

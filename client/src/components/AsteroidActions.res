open ReScriptUrql

let makeCoorbitalLink = orbitalPeriod => {
  open PageQueryParams.AsteroidPageParamType
  Link.Internal(
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
}

@react.component
let make = (
  ~className="",
  ~id,
  ~actionTextBreakpoint,
  ~showInternalLink=false,
  ~reloadOnCoorbital=false,
) => {
  let ({Hooks.response: response}, _) = Hooks.useQuery(~query=module(Queries.Asteroid), {id: id})
  let strId = Belt.Int.toString(id)

  let makeAction = (~iconWidth="", ~forceReload=false, link, icon, text) => {
    <button key=text>
      <Link to_=link titleText=text forceReload>
        <Icon className=iconWidth kind=icon text breakpoint={actionTextBreakpoint} />
      </Link>
    </button>
  }

  switch response {
  | Data({asteroid: Some(rock)}) => {
      let actions = [
        rock.owner->Belt.Option.map(_ =>
          makeAction(Link.makeAsteroidOpenSeaLink(strId), Icon.openSea, "OpenSea")
        ),
        makeAction(Link.makeGameRoidLink(strId), Icon.influence, "Game")->Some,
        makeAction(
          makeCoorbitalLink(rock.orbitalPeriod),
          Icon.Fas("globe"),
          "Co-Orbitals",
          ~iconWidth="w-6",
          ~forceReload=reloadOnCoorbital,
        )->Some,
        switch showInternalLink {
        | false => None
        | true =>
          makeAction(Link.Internal(Route.Asteroid(strId)), Icon.Fas("meteor"), "Details")->Some
        },
      ]
      <div className> {actions->Belt.Array.keepMap(e => e)->React.array} </div>
    }
  | _ => React.null
  }
}

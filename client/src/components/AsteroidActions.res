open ReScriptUrql

@react.component
let make = (~className="", ~id, ~actionTextBreakpoint, ~showInternalLink=false) => {
  let ({Hooks.response: response}, _) = Hooks.useQuery(~query=module(Queries.Asteroid), {id: id})
  let strId = Belt.Int.toString(id)
  let {setFilters} = AsteroidFilters.Store.use()

  let makeAction = (~iconWidth="", ~link=?, ~onClick=?, icon, text) => {
    let icon =
      <Icon className={`${iconWidth} text-primary-std`} kind=icon breakpoint={actionTextBreakpoint}>
        <span className="text-primary-std"> {text->React.string} </span>
      </Icon>
    switch (link, onClick) {
    | (Some(to_), _) =>
      <Vechai.Button className="justify-start" size={#lg} key=text>
        <Link to_ titleText=text> icon </Link>
      </Vechai.Button>
    | (_, Some(onClick)) =>
      <Vechai.Button size={#lg} key=text onClick={_ => onClick()}> icon </Vechai.Button>
    | _ => React.null
    }
  }

  let onCoorbitalClick = sma => {
    setFilters({
      ...AsteroidFilters.defaultFilters,
      AsteroidFilters.semiMajorAxis: {
        AsteroidFilters.Filter.active: true,
        value: (sma, sma),
      },
    })
    Route.go(Route.Asteroids)
  }

  switch response {
  | Data({asteroid: Some(rock)}) => {
      let actions = [
        rock.owner->Belt.Option.map(_ =>
          makeAction(~link=Link.makeAsteroidOpenSeaLink(strId), Icon.openSea, "OpenSea")
        ),
        makeAction(~link=Link.makeGameRoidLink(strId), Icon.influence, "Game")->Some,
        makeAction(
          ~onClick={() => onCoorbitalClick(rock.semiMajorAxis)},
          Icon.Fas("globe"),
          "Co-Orbitals",
          ~iconWidth="w-6",
        )->Some,
        switch showInternalLink {
        | false => None
        | true =>
          makeAction(
            ~link=Link.Internal(Route.Asteroid(strId)),
            Icon.Fas("meteor"),
            "Details",
          )->Some
        },
      ]
      <div className> {actions->Belt.Array.keepMap(e => e)->React.array} </div>
    }
  | _ => React.null
  }
}

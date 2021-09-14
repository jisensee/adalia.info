@val @scope("location") external reload: unit => unit = "reload"

type kind =
  | Internal(Route.t)
  | External(string)

let influence = External("https://influenceth.io")
let influenceGame = External("https://game.influenceth.io")
let makeGameRoidLink = id => External("https://game.influenceth.io/asteroids/" ++ id)

let githubRepo = External("https://github.com/jisensee/adalia.info")
let discord = External("https://discord.gg/XynYK5yCQy")

let openSea = External("https://opensea.io")
let etherscan = External("https://etherscan.io")

let makeAsteroidOpenSeaLink = id => External(
  `https://opensea.io/assets/0x6e4c6d9b0930073e958abd2aba516b885260b8ff/${id}`,
)

let makeReleaseLink = version => External(
  `https://github.com/jisensee/adalia.info/releases/tag/${version}`,
)

@react.component
let make = (
  ~to_,
  ~children=?,
  ~text=?,
  ~highlight=true,
  ~bold=true,
  ~hover=true,
  ~titleText=?,
  ~className="",
  ~forceReload=false,
  ~onClick=() => (),
) => {
  let title = switch (titleText, text) {
  | (Some(title), _) => title
  | (None, Some(text)) => text
  | _ => ""
  }
  let (href, target, internal) = switch to_ {
  | Internal(route) => (route->Route.toUrl, "_self", true)
  | External(url) => (url, "_blank", false)
  }
  let highlightClass = switch (highlight, bold) {
  | (true, true) => "text-cyan font-bold"
  | (true, false) => "text-cyan"
  | (false, true) => "font-bold"
  | (false, false) => ""
  }
  let onClick = event => {
    if internal {
      event->ReactEvent.Mouse.preventDefault
      href->RescriptReactRouter.push
    }
    if forceReload {
      reload()
    }
    onClick()
  }
  let hoverClass = switch hover {
  | false => ""
  | true => "hover:text-blue-dark"
  }
  <a href target title className={`${highlightClass} ${hoverClass} ${className}`} onClick>
    {switch (children, text) {
    | (Some(c), _) => c
    | (None, Some(txt)) => txt->React.string
    | _ => React.null
    }}
  </a>
}

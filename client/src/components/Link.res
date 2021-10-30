@val @scope("location") external reload: unit => unit = "reload"

type kind =
  | Internal(Route.t)
  | External(string)

let influence = External("https://influenceth.io")
let influenceGame = External("https://game.influenceth.io")
let makeGameRoidLink = id => External("https://game.influenceth.io/asteroids/" ++ id)

let wiki = External("https://wiki.influenceth.io/")
let githubRepo = External("https://github.com/jisensee/adalia.info")
let discord = External("https://discord.gg/XynYK5yCQy")
let influenceAssetExport = External("https://github.com/jisensee/influence-asset-export")
let discoverAdalia = External("https://discover.adalia.id")
let influenceInternationalDiscord = External("https://discord.gg/gX3r2BDNwR")
let influenceSalesSpace = External("https://influence-sales.space")
let cosmos = External("https://github.com/ScreamingHawk/cosmos-influence-bot")
let influenceUtils = External("https://github.com/Influenceth/influence-utils")

let openSea = External("https://opensea.io")
let openSeaAsteroids = External("https://opensea.io/collection/influenceth-asteroids")
let openSeaCrew = External("https://opensea.io/collection/influence-crew")
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

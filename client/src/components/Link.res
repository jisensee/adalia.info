type kind =
  | Internal(Route.t)
  | External(string)

let referralParam = "?r=0xD90b1056F1E5DA3d81D09D643e6AC092ec3a7871"

let influence = External("https://influenceth.io")
let influenceGame = External("https://game.influenceth.io" ++ referralParam)
let makeGameRoidLink = id => External("https://game.influenceth.io/" ++ id ++ referralParam)
let githubRepo = External("https://github.com/jisensee/adalia.info")
let discord = External("https://discord.gg/XynYK5yCQy")
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
  ~className="",
) => {
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
  }
  let hoverClass = switch hover {
  | false => ""
  | true => "hover:text-blue-400"
  }
  <a href target className={`${highlightClass} ${hoverClass} ${className}`} onClick>
    {switch (children, text) {
    | (Some(c), _) => c
    | (None, Some(txt)) => txt->React.string
    | _ => React.null
    }}
  </a>
}

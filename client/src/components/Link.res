type kind =
  | Internal(Route.t)
  | External(string)

let influence = External("https://www.influenceth.io")
let influenceGame = External("https://www.influenceth.io")
let githubRepo = External("https://www.github.com/jisensee/adalia.info")

@react.component
let make = (~to_, ~children=?, ~text=?, ~highlight=true, ~bold=true, ~className="") => {
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
  <a href target className={`${highlightClass} ${className}`} onClick>
    {switch (children, text) {
    | (Some(c), _) => c
    | (None, Some(txt)) => txt->React.string
    | _ => React.null
    }}
  </a>
}

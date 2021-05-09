type kind =
  | Internal(Route.t)
  | External(string)

@react.component
let make = (~to_, ~children, ~className="") => {
  let (href, target, internal) = switch to_ {
  | Internal(route) => (route->Route.toUrl, "_self", true)
  | External(url) => (url, "_blank", false)
  }
  let onClick = event => {
    if internal {
      event->ReactEvent.Mouse.preventDefault
      href->RescriptReactRouter.push
    }
  }
  <a href target className onClick> children </a>
}

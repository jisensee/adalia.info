@react.component
let make = (~to_, ~children, ~className="") => {
  let href = to_->Route.toUrl
  let onClick = event => {
    event->ReactEvent.Mouse.preventDefault
    href->RescriptReactRouter.push
  }
  <a href className onClick> children </a>
}

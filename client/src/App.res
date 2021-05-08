@react.component
let make = () => {
  let pageComp = RescriptReactRouter.useUrl()->Route.fromUrl->Pages.fromRoute
  <div className="container mx-auto"> {pageComp} </div>
}

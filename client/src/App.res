@react.component
let make = () => {
  let pageComp = RescriptReactRouter.useUrl()->Route.fromUrl->Pages.fromRoute
  <> <Navbar /> <div className="container mx-auto p-4"> {pageComp} </div> </>
}

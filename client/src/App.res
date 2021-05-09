@react.component
let make = () => {
  let pageComp = RescriptReactRouter.useUrl()->Route.fromUrl->Pages.fromRoute
  <> <Navbar /> <div className="container mx-auto mt-5"> {pageComp} </div> </>
}

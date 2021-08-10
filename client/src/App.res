@react.component
let make = () => {
  let pageComp = RescriptReactRouter.useUrl()->Route.fromUrl->Pages.fromRoute
  <>
    <Navbar className="sticky top-0 z-50" />
    <div className="container mx-auto p-4"> {pageComp} </div>
    <Footer />
  </>
}

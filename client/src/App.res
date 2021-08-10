open ReScriptUrql

@react.component
let make = () => {
  let ({Hooks.response: response}, _) = Hooks.useQuery(~query=module(Queries.LastDataUpdateAt), ())
  let lastDataUpdateAt: option<Js.Date.t> = switch response {
  | Data(d) => d.lastDataUpdateAt
  | _ => None
  }
  let pageComp = RescriptReactRouter.useUrl()->Route.fromUrl->Pages.fromRoute
  <>
    <Navbar className="sticky top-0 z-50" />
    <div className="container mx-auto p-4"> {pageComp} </div>
    <Footer ?lastDataUpdateAt />
  </>
}

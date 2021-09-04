let client = ReScriptUrql.Client.make(~url="/graphql", ())

module Provider = {
  @react.component
  let make = (~children) =>
    <ReScriptUrql.Context.Provider value=client> {children} </ReScriptUrql.Context.Provider>
}

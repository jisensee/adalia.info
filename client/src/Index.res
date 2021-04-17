open ReScriptUrql

%%raw(`import './index.css'`)

let client = Client.make(~url="/graphql", ())

switch ReactDOM.querySelector("#root") {
| Some(root) =>
  ReactDOM.render(
    <React.StrictMode>
      <Context.Provider value=client> <App /> </Context.Provider>
    </React.StrictMode>,
    root,
  )
| None => ()
}

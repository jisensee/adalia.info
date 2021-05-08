%%raw(`import './index.css'`)
%%raw(`import '@fontsource/jura'`)

switch ReactDOM.querySelector("#root") {
| Some(root) =>
  ReactDOM.render(
    <React.StrictMode> <ContextProvider> <App /> </ContextProvider> </React.StrictMode>,
    root,
  )
| None => ()
}

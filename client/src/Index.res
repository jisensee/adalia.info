%%raw(`import './css/index.css'`)
%%raw(`import '@fontsource/jura'`)
%%raw(`import '@fortawesome/fontawesome-free/css/all.css'`)

switch ReactDOM.querySelector("#root") {
| Some(root) =>
  ReactDOM.render(
    <React.StrictMode> <UrqlContext.Provider> <App /> </UrqlContext.Provider> </React.StrictMode>,
    root,
  )
| None => ()
}

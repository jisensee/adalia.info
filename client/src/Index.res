%%raw(`import './css/index.css'`)
%%raw(`import '@fontsource/jura'`)
%%raw(`import '@fortawesome/fontawesome-free/css/all.css'`)

%%raw(`import 'rc-slider/assets/index.css'`)

switch ReactDOM.querySelector("#root") {
| Some(root) =>
  ReactDOM.render(
    <React.StrictMode> <UrqlContext.Provider> <App /> </UrqlContext.Provider> </React.StrictMode>,
    root,
  )
| None => ()
}

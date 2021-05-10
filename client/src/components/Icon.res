type kind =
| Fas(string)
| Fab(string)
| Custom(string)

@react.component
let make = (~children=?, ~kind, ~large=false) => {
  let size = switch large {
  | true => "text-4xl"
  | false => ""
  }
let makeFaIcon = (icon, class) => <i className={`${class} fa-${icon} ${size}`} />
  let icon = switch kind {
  | Fas(icon) => makeFaIcon(icon, "fas")
  | Fab(icon) => makeFaIcon(icon, "fab")
  | Custom(icon) => <img src=`/icons/${icon}` />
  }
  switch children {
  | None => icon
  | Some(c) => <div className="flex flex-row space-x-1 items-center"> icon  <span>c</span> </div>
  }
}

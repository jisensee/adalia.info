type kind =
  | Fas(string)
  | Fab(string)
  | Custom(string)

type rotation = Rotate90 | Rotate180 | Rotate270

@react.component
let make = (~children=?, ~className="", ~kind, ~large=false, ~rotation=?) => {
  let size = switch large {
  | true => "text-4xl"
  | false => ""
  }
  let rotationClass = switch rotation {
  | None => ""
  | Some(Rotate90) => "fa-rotate-90"
  | Some(Rotate180) => "fa-rotate-180"
  | Some(Rotate270) => "fa-rotate-270"
  }
  let makeFaIcon = (icon, class) =>
    <i className={`${className} ${class} fa-${icon} ${rotationClass} ${size}`} />
  let icon = switch kind {
  | Fas(icon) => makeFaIcon(icon, "fas")
  | Fab(icon) => makeFaIcon(icon, "fab")
  | Custom(icon) => <img src={`/icons/${icon}`} />
  }
  switch children {
  | None => icon
  | Some(c) => <div className="flex flex-row space-x-1 items-center"> icon <span> c </span> </div>
  }
}

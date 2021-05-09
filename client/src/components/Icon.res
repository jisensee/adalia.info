@react.component
let make = (~children=?, ~showing, ~brand=false, ~large=false) => {
  let prefix = switch brand {
  | true => "fab"
  | false => "fas"
  }
  let size = switch large {
  | true => "text-3xl"
  | false => ""
  }
  let icon = <i className={`${prefix} ${size} fa-${showing}`} />
  switch children {
  | None => icon
  | Some(c) => <div className="flex flex-row"> icon c </div>
  }
}

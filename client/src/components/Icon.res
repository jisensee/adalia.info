type kind =
  | Fas(string)
  | Fab(string)
  | Custom(string)

type rotation = Rotate90 | Rotate180 | Rotate270

type breakpoint =
  | None
  | Sm
  | Md
  | Lg

let openSea = Custom("opensea.svg")
let influence = Custom("influence.svg")

@react.component
let make = (
  ~children=?,
  ~text=?,
  ~className="",
  ~imageClassName="",
  ~kind,
  ~large=false,
  ~rotation=?,
  ~breakpoint=None,
) => {
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
  | Custom(icon) => {
      let width = switch large {
      | true => "h-10"
      | false => "h-6"
      }
      <img className={`${width} ${imageClassName}`} src={`/icons/${icon}`} />
    }
  }
  let makeWithChildren = c => {
    let responsiveClassName = switch breakpoint {
    | None => ""
    | Sm => "hidden sm:inline"
    | Md => "hidden md:inline"
    | Lg => "hidden lg:inline"
    }
    <div className="flex flex-row space-x-3 items-center">
      icon <span className={`${responsiveClassName} ml-2`}> c </span>
    </div>
  }
  switch (children, text) {
  | (Some(c), None) => makeWithChildren(c)
  | (None, Some(t)) => makeWithChildren(t->React.string)
  | _ => icon
  }
}

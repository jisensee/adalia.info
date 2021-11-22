open Belt

@send external toLocaleString: float => string = "toLocaleString"

let getText = (~value, ~max, ~percent) => {
  let valueStr = value->Int.toFloat->toLocaleString
  let maxStr = max->Int.toFloat->toLocaleString
  let percentStr = percent->toLocaleString
  `${valueStr} / ${maxStr} (${percentStr} %)`
}

let getPercent = (~value, ~max) => {
  let percent = value /. max *. 100.
  Js.Math.round(percent *. 100.) /. 100.
}

type textConfig = {
  className: string,
  content: string,
}

let defaultTextConfigs = (~unit=?, ~title, ~value, ~max, ~formatValue, ~formatMax, ()) => {
  let percentage = (value /. max *. 100.)->Format.formatFloat(1) ++ "%"
  let formattedValue = value->formatValue ++ unit->Option.getWithDefault("")
  let formattedMax = max->formatMax ++ unit->Option.getWithDefault("")

  [
    {
      className: "xs:hidden",
      content: `${title} ${formattedValue}`,
    },
    {
      className: "hidden xs:inline sm:hidden",
      content: `${title} ${formattedValue} (${percentage})`,
    },
    {
      className: "hidden sm:inline",
      content: `${title} ${formattedValue} / ${formattedMax} (${percentage})`,
    },
  ]
}

@react.component
let make = (~value, ~max, ~textConfigs) => {
  let percent = getPercent(~value, ~max)
  let width = `${percent->Float.toString}%`

  <svg className="w-full h-10">
    <rect width="100%" height="100%" className="fill-current" />
    <rect key=width width height="100%" className="text-primary-std fill-current">
      <animate attributeName="width" from="0" to_=width dur="0.5s" />
    </rect>
    {textConfigs
    ->Belt.Array.map(({content, className}) =>
      <text
        key=content
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className={`text-black fill-current text-xl ${className}`}>
        {content->React.string}
      </text>
    )
    ->React.array}
  </svg>
}

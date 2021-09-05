open Belt

@send external toLocaleString: float => string = "toLocaleString"

let getText = (~count, ~total, ~percent) => {
  let countStr = count->Int.toFloat->toLocaleString
  let totalStr = total->Int.toFloat->toLocaleString
  let percentStr = percent->toLocaleString
  `${countStr} / ${totalStr} (${percentStr} %)`
}

let getPercent = (~count, ~total) => {
  let percent = count->Int.toFloat /. total->Int.toFloat *. 100.
  Js.Math.round(percent *. 100.) /. 100.
}

type textConfig = {
  className: string,
  content: string,
}

@react.component
let make = (~count, ~total, ~textConfigs) => {
  let percent = getPercent(~count, ~total)
  let width = `${percent->Float.toString}%`

  <svg className="w-full h-10">
    <rect width="100%" height="100%" className=" text-gray-lighter fill-current" />
    <rect width height="100%" className="text-cyan fill-current">
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

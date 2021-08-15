@react.component
let make = (~className="", ~children, ~titleComp, ~isOpen, ~onOpenChange) => {
  let (iconRotation, height) = switch isOpen {
  | false => (None, "max-h-0")
  | true => (Some(Icon.Rotate90), "max-h-96")
  }
  <div className>
    <div className="cursor-pointer" onClick={_ => onOpenChange(!isOpen)}>
      <Icon
        className="text-cyan w-3 transition-all duration-300 mr-2"
        kind={Icon.Fas("chevron-right")}
        rotation=?iconRotation>
        titleComp
      </Icon>
    </div>
    <div
      className={`flex flex-col items-start ${height} overflow-hidden transition-max-h duration-300 ease-in-out`}>
      children
    </div>
  </div>
}

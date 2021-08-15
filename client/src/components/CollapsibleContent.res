let make = (~className="", ~children, ~titleComp, ~isOpen, ~onOpenChange) => {
  let (iconRotation, height) = switch isOpen {
  | true => (Some(Icon.Rotate90), "h-full")
  | false => (None, "max-h-0")
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
      className={`flex flex-col items-start overflow-hidden ${height} transition-max-height duration-300 ease-in-out`}>
      children
    </div>
  </div>
}
